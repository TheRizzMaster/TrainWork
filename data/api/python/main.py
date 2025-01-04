from fastapi import FastAPI, Query, HTTPException
from typing import List, Dict
import mysql.connector
from datetime import datetime, timedelta, time
import uvicorn
import requests
from geopy.distance import geodesic
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)

# Database configuration
DB_CONFIG = {
    'user': '*****',
    'password': '*****',
    'host': '*****',
    'database': '*****'
}

def get_db_connection():
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        return cnx
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {err}")

# Convert minutes of the day into "HH:MM" format
def minutes_to_time(minutes_of_day: int) -> str:
    hours = int(minutes_of_day // 60)
    minutes = int(minutes_of_day % 60)
    return f"{hours:02}:{minutes:02}"

# Recursive function to find routes
def requestRoutes(
    von: str,
    ab: str,
    ankunftszeit_obj: datetime,
    final_destination: str,
    max_waiting_time: int,
    legs=None,
    previous_departure=None,
    visited=None,
    routen=None
) -> List[List[Dict]]:
    if legs is None:
        legs = []
    if visited is None:
        visited = set()
    if routen is None:
        routen = []

    visited.add(von)

    # Ensure `ab` is a string
    if isinstance(ab, time):  # Check if ab is a `datetime.time`
        ab = ab.strftime('%H:%M:%S')  # Convert to string

    abfahrts_time_obj = datetime.strptime(ab, '%H:%M:%S')
    plus_waiting_time = abfahrts_time_obj + timedelta(minutes=max_waiting_time)

    cnx = get_db_connection()
    cursor = cnx.cursor()

    try:
        query = '''
        SELECT from_name, to_name, departure, arrival, type, from_platform, to_platform
        FROM connections
        WHERE from_name = %s
        AND departure >= %s
        AND departure <= %s;
        '''
        cursor.execute(query, (von, ab, plus_waiting_time.time()))
        result = cursor.fetchall()
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Query error: {err}")
    finally:
        cnx.close()

    if not result:
        return routen

    for row in result:
        from_name, to_name, departure, arrival, conn_type, from_platform, to_platform = row

        # Convert times
        departure_time = datetime.strptime(str(departure), '%H:%M:%S')
        arrival_time = datetime.strptime(str(arrival), '%H:%M:%S')
        dayminutes = arrival_time.hour * 60 + arrival_time.minute

        # Skip invalid connections
        if dayminutes > ankunftszeit_obj.hour * 60 + ankunftszeit_obj.minute:
            continue

        if previous_departure == to_name and previous_departure is not None:
            continue

        if to_name == final_destination and dayminutes < (ankunftszeit_obj.hour * 60 + ankunftszeit_obj.minute) - 30:
            continue

        # Build the leg
        leg = {
            'from': from_name,
            'to': to_name,
            'departure': departure_time.strftime('%H:%M'),
            'arrival': arrival_time.strftime('%H:%M'),
            'type': conn_type,
            'from_platform': from_platform,
            'to_platform': to_platform
        }

        # Create a new list of legs for this recursive call
        new_legs = legs + [leg]

        # Check if this is the final destination
        if to_name == final_destination and dayminutes >= (ankunftszeit_obj.hour * 60 + ankunftszeit_obj.minute) - 30:
            if new_legs not in routen:
                routen.append(new_legs)
            continue

        # Recurse for intermediate connections
        requestRoutes(
            to_name,
            str(arrival),
            ankunftszeit_obj,
            final_destination,
            max_waiting_time,
            new_legs,
            from_name,
            visited.copy(),
            routen
        )

    return routen


# Calculate the total duration of a route
def calculate_route_duration(route):
    """
    Calculate the total duration of a route from first departure to last arrival.
    """
    first_departure_str = route[0]['departure']
    first_departure = datetime.strptime(first_departure_str, '%H:%M')

    last_arrival_str = route[-1]['arrival']
    last_arrival = datetime.strptime(last_arrival_str, '%H:%M')

    # Calculate the total duration in minutes
    duration = (last_arrival - first_departure).total_seconds() / 60
    return duration

# Count the number of legs in the route
def count_route_legs(route):
    """
    Count the number of legs in the route.
    """
    return len(route)

# Filter and sort routes by duration and legs
def get_best_routes_by_duration_and_legs(routen, top_n=5):
    """
    Sort routes by longest travel time first and then by the fewest legs.
    Return only the top N routes (default is 5).
    """
    # Calculate both the duration and the number of legs for each route
    routes_with_metrics = [
        (route, calculate_route_duration(route), count_route_legs(route)) 
        for route in routen
    ]

    # Sort routes first by duration (descending), then by the number of legs (ascending)
    sorted_routes = sorted(
        routes_with_metrics, 
        key=lambda x: (-x[1], x[2])  # Sort by negative duration for descending order, then by legs ascending
    )

    # Slice the top N routes and return only those
    best_routes = [route for route, duration, legs in sorted_routes[:top_n]]
    return best_routes


# Find routes between two locations
def find_routes_two_locations(start_location, end_location, time1, date1, time2, date2):
    def fetch_coordinates(location):
        base_url = f"http://transport.opendata.ch/v1/locations?query={location}"
        response = requests.get(base_url)
        if response.status_code == 200:
            data = response.json()
            if data["stations"]:
                return data["stations"][0]["coordinate"]["x"], data["stations"][0]["coordinate"]["y"]
            else:
                raise ValueError(f"No stations found for location: {location}")
        else:
            raise ConnectionError(f"Error fetching coordinates for {location}: {response.status_code}")

    def find_nearest_stations(x, y, cursor, limit=3):
        query = "SELECT name, x, y FROM knotenpunkte"
        cursor.execute(query)
        stations = cursor.fetchall()

        input_coords = (x, y)
        station_distances = [
            (station, geodesic(input_coords, (station[1], station[2])).kilometers)
            for station in stations
        ]

        # Sort stations by distance and return the closest `limit`
        nearest_stations = sorted(station_distances, key=lambda item: item[1])[:limit]
        return [station[0] for station in nearest_stations]  # Return only the station details

    def fetch_routes(from_location, to_location, time, date, is_arrival=False):
        base_url = f"http://transport.opendata.ch/v1/connections"
        params = {
            "from": from_location,
            "to": to_location,
            "time": time,
            "date": date,
            "limit": 1
        }
        if is_arrival:
            params["isArrivalTime"] = 1
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            raise ConnectionError(f"Error fetching routes: {response.status_code}")

    def find_best_station(start_or_end, x, y, time, date, is_arrival):
        nearest_stations = find_nearest_stations(x, y, cursor)
        best_station = None
        best_duration = float("inf")
        best_route = None

        for station in nearest_stations:
            routes = fetch_routes(start_or_end, station[0], time, date, is_arrival=is_arrival)
            print(f"Debug: Routes for station {station[0]}:", routes)

            if routes.get("connections"):
                connection = routes["connections"][0]
                departure = datetime.fromisoformat(connection["from"]["departure"])
                arrival = datetime.fromisoformat(connection["to"]["arrival"])
                duration = (arrival - departure).total_seconds()

                if duration < best_duration:
                    best_station = station[0]
                    best_duration = duration
                    best_route = connection

        if not best_station or not best_route:
            raise ValueError(f"No valid connections found for {start_or_end}.")

        return best_station, best_route

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        # Start location
        x1, y1 = fetch_coordinates(start_location)
        best_station_start, best_route_start = find_best_station(
            start_location, x1, y1, time1, date1, is_arrival=False
        )
        # print("Debug: Best start station:", best_station_start)

        # End location
        x2, y2 = fetch_coordinates(end_location)
        best_station_end, best_route_end = find_best_station(
            end_location, x2, y2, time2, date2, is_arrival=True
        )
        # print("Debug: Best end station:", best_station_end)

        # Format the results
        result = {
            "start_to_nearest": {
                "from": start_location,
                "to": best_station_start,
                "from_platform": best_route_start["from"]["platform"],
                "to_platform": best_route_start["to"]["platform"],
                "journey": best_route_start["sections"][0]["journey"],
                "type": best_route_start["products"],
                "connections": [
                    {
                        "departure": best_route_start["from"]["departure"],
                        "arrival": best_route_start["to"]["arrival"]
                    }
                ]
            },
            "nearest_to_end": {
                "from": best_station_end,
                "to": end_location,
                "from_platform": best_route_end["from"]["platform"],
                "to_platform": best_route_end["to"]["platform"],
                "journey": best_route_end["sections"][0]["journey"],
                "type": best_route_end["products"],
                "connections": [
                    {
                        "departure": best_route_end["from"]["departure"],
                        "arrival": best_route_end["to"]["arrival"]
                    }
                ]
            }
        }

        return result

    except Exception as e:
        return {"error": str(e)}
    finally:
        try:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()
        except ReferenceError:
            pass


# Updated FastAPI Endpoint
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/get_routes")
def get_routes(
    Abfahrtsort: str = Query(..., description="Departure location"),
    Ankunftsort: str = Query(..., description="Arrival location"),
    Abfahrtszeit: str = Query(..., description="Departure time in YYYY-MM-DDTHH:MM format"),
    Ankunftszeit: str = Query(..., description="Latest arrival time in YYYY-MM-DDTHH:MM format"),
    max_waiting_time: int = Query(15, description="Maximum waiting time in minutes"),
    top_n: int = Query(5, description="Number of top routes to return")
):
    try:
        # Parse and validate times (now including date and time)
        abfahrtszeit_obj = datetime.strptime(Abfahrtszeit, '%Y-%m-%dT%H:%M')
        ankunftszeit_obj = datetime.strptime(Ankunftszeit, '%Y-%m-%dT%H:%M')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use YYYY-MM-DDTHH:MM.")

    if abfahrtszeit_obj >= ankunftszeit_obj:
        raise HTTPException(status_code=400, detail="Departure time must be earlier than arrival time.")

    print(f"Finding Best Routes from {Abfahrtsort} to {Ankunftsort} between {Abfahrtszeit} and {Ankunftszeit} with a maximum waiting time of {max_waiting_time} minutes.")

    # Split into date and time components
    abfahrts_date = abfahrtszeit_obj.date().strftime('%Y-%m-%d')
    abfahrts_time = abfahrtszeit_obj.time().strftime('%H:%M')

    ankunfts_date = ankunftszeit_obj.date().strftime('%Y-%m-%d')
    ankunfts_time = ankunftszeit_obj.time().strftime('%H:%M')

    # Fetch connections (assuming the function requires date and time separately)
    anschlussverbindungen = find_routes_two_locations(
        Abfahrtsort,
        Ankunftsort,
        abfahrts_time,
        abfahrts_date,
        ankunfts_time,
        ankunfts_date
    )


    # Log the response for debugging
    print("anschlussverbindungen:", anschlussverbindungen)

    # Handle missing keys and empty connections
    if "start_to_nearest" not in anschlussverbindungen:
        raise HTTPException(status_code=500, detail="'start_to_nearest' key is missing in response.")

    if not anschlussverbindungen["start_to_nearest"].get("connections"):
        raise HTTPException(status_code=404, detail="No connections found in 'start_to_nearest'.")

    if "nearest_to_end" not in anschlussverbindungen:
        raise HTTPException(status_code=500, detail="'nearest_to_end' key is missing in response.")

    if not anschlussverbindungen["nearest_to_end"].get("connections"):
        raise HTTPException(status_code=404, detail="No connections found in 'nearest_to_end'.")

    # Extract and adjust times
    start_to_nearest_arrival_time_raw = anschlussverbindungen["start_to_nearest"]["connections"][0]["arrival"]
    start_to_nearest_arrival_time = datetime.strptime(
        start_to_nearest_arrival_time_raw[:19], "%Y-%m-%dT%H:%M:%S"
    ) + timedelta(minutes=5)
    # start_to_nearest_arrival_time_formatted = start_to_nearest_arrival_time.strftime("%H:%M:%S")
    start_to_nearest_arrival_time_formatted = start_to_nearest_arrival_time.time()

    nearest_station_from_start = anschlussverbindungen["start_to_nearest"]["to"]

    nearest_to_end_departure_time_raw = anschlussverbindungen["nearest_to_end"]["connections"][0]["departure"]
    nearest_to_end_departure_time = datetime.strptime(
        nearest_to_end_departure_time_raw[:19], "%Y-%m-%dT%H:%M:%S"
    ) - timedelta(minutes=5)
    # nearest_to_end_departure_time_formatted = nearest_to_end_departure_time.strftime("%H:%M:%S")
    nearest_to_end_departure_time_formatted = nearest_to_end_departure_time.time()

    nearest_station_from_end = anschlussverbindungen["nearest_to_end"]["from"]

    # Fetch routes
    routen = requestRoutes(
        nearest_station_from_start,
        start_to_nearest_arrival_time_formatted,
        nearest_to_end_departure_time_formatted,
        nearest_station_from_end,
        max_waiting_time
    )

    if not routen:
        return {"message": "No routes found"}

    # Filter and sort the best routes
    best_routes = get_best_routes_by_duration_and_legs(routen, top_n=top_n)

    return {
        "anschlussverbindungen": anschlussverbindungen,
        "best_routes": best_routes
    }


# Run the FastAPI application using Uvicorn
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=80
    )
