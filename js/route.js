const params = new URLSearchParams(window.location.search);
const routeIndex = params.get('route');

async function getRouteData() {
    try {
        const response = await fetch('./data/testdata.json');
        const data = await response.json();
        const route = data.best_routes[routeIndex];

        displayRouteDetails(route);
    } catch (error) {
        console.error("Failed to fetch route details", error);
    }
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
        <p class="departureTime"><strong>${trip.departure}</strong></p>
        <p class="arrivalTime"><strong>${trip.arrival}</strong></p>
        <svg class="line" width="2" height="119" viewBox="0 0 2 119" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 0L0.999995 119" stroke="black" stroke-width="2"/>
</svg>

        <p class="from"><strong>${trip.from}</strong></p>
        <p class="to"><strong>${trip.to}</strong></p>
        <p class="type"><strong>${trip.type}</strong> </p>
        <p class="departurePlatform"><strong>Gleis:</strong> ${trip.platform}</p>
    `;

        container.appendChild(tripCard);
    });
}

getRouteData();