const params = new URLSearchParams(window.location.search);
const routeIndex = params.get('route');

function getRouteDataFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('routeResults');
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
            console.error("No route data found in localStorage.");
        }
    } catch (error) {
        console.error("Failed to fetch route details from localStorage", error);
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

    route.forEach(trip => {
        const tripCard = document.createElement('div');
        tripCard.classList.add('trip-card');

        tripCard.innerHTML = `
        <p class="departureTime"><strong>${formatTime(trip.departure)}</strong></p>
        <p class="arrivalTime"><strong>${formatTime(trip.arrival)}</strong></p>
        <svg class="line" width="2" height="119" viewBox="0 0 2 119" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 0L0.999995 119" stroke="black" stroke-width="2"/>
</svg>

        <p class="from"><strong>${trip.from}</strong></p>
        <p class="to"><strong>${trip.to}</strong></p>
        <p class="type"><strong>${trip.type || '-'}</strong></p>
        <p class="departurePlatform"><strong>Gleis:</strong> ${trip.from_platform || '-'}</p>
        <p class="arrivalPlatform"><strong>Gleis:</strong> ${trip.to_platform || '-'}</p>
    `;

        container.appendChild(tripCard);
    });
}

getRouteDataFromLocalStorage();
