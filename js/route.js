const params = new URLSearchParams(window.location.search);
const routeIndex = params.get('route');

function getRouteDataFromsessionStorage() {
    try {
        const savedData = sessionStorage.getItem('routeResults');
        if (savedData) {
            const data = JSON.parse(savedData);
            const route = data.best_routes[routeIndex];
            const startToNearest = data.anschlussverbindungen.start_to_nearest;
            const nearestToEnd = data.anschlussverbindungen.nearest_to_end;

            // Combine start_to_nearest, route, and nearest_to_end
            const completeRoute = [
                { ...startToNearest, from: startToNearest.from, to: startToNearest.to, departure: startToNearest.connections[0].departure, arrival: startToNearest.connections[0].arrival },
                ...route,
                { ...nearestToEnd, from: nearestToEnd.from, to: nearestToEnd.to, departure: nearestToEnd.connections[0].departure, arrival: nearestToEnd.connections[0].arrival }
            ];

            displayRouteDetails(completeRoute);
        } else {
            console.error("No route data found in sessionStorage.");
        }
    } catch (error) {
        console.error("Failed to fetch route details from sessionStorage", error);
    }
}

function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function displayRouteDetails(route) {
    const container = document.getElementById('route-details');

    const routeTitle = document.createElement('h1');
    routeTitle.textContent = `${route[0].from} → ${route[route.length - 1].to}`;
    container.appendChild(routeTitle);

    route.forEach((trip, index) => {
        const tripCard = document.createElement('div');
        tripCard.classList.add('trip-card');

        // Only format time for start_to_nearest and nearest_to_end
        const departureTime = index === 0 || index === route.length - 1 ? formatTime(trip.departure) : trip.departure;
        const arrivalTime = index === 0 || index === route.length - 1 ? formatTime(trip.arrival) : trip.arrival;

        tripCard.innerHTML = `
        <p class="departureTime"><strong>${departureTime}</strong></p>
        <p class="arrivalTime">${arrivalTime}</p>
        <div class="line"></div>
        <p class="from"><strong>${trip.from}</strong></p>
        <p class="to">${trip.to}</p>
        <p class="type"><strong>${trip.type || '-'}</strong></p>
        <p class="departurePlatform"><strong>Gleis: ${trip.from_platform || '-'}</strong></p>
        <p class="arrivalPlatform">Gleis: ${trip.to_platform || '-'}</p>
    `;

        container.appendChild(tripCard);
    });
}

getRouteDataFromsessionStorage();
