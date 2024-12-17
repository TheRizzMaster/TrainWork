// Get references to DOM elements
const departure = document.getElementById('departure');
const arrival = document.getElementById('destination');
const suggestionsDeparture = document.getElementById('suggestionsDeparture');
const suggestionsDestination = document.getElementById('suggestionsDestination');
const form = document.getElementById('trainForm'); // Get the form element
const departureTimeInput = document.getElementById('departureTime');
const arrivalTimeInput = document.getElementById('arrivalTime');
const container = document.getElementById('routes-container');

console.log("Combined script loaded");

// Restrict departure time to not be in the past
function setMinDepartureTime() {
    const now = new Date();
    const dateString = now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
    const timeString = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const minString = dateString + "T" + timeString;
    departureTimeInput.min = minString;
    console.log("Setting min departure time to", minString);
}

// Restrict arrival time to be within the same day as departure and after departure
function updateArrivalTimeConstraints() {
    const departureTime = new Date(departureTimeInput.value);
    console.log("Departure time:", departureTime);
    
    if (!isNaN(departureTime)) {
        arrivalTimeInput.min = departureTime.toISOString().slice(0, 16);
        const endOfDay = new Date(departureTime);
        endOfDay.setHours(23, 59, 59, 999);
        arrivalTimeInput.max = endOfDay.getFullYear() + "-" + (endOfDay.getMonth() + 1).toString().padStart(2, '0') + "-" + endOfDay.getDate().toString().padStart(2, '0') + "T23:59";
    }
}

setMinDepartureTime();

departureTimeInput.addEventListener('change', () => {
    updateArrivalTimeConstraints();
    const arrivalTime = new Date(arrivalTimeInput.value);
    const departureTime = new Date(departureTimeInput.value);
    if (arrivalTime < departureTime) {
        arrivalTimeInput.value = '';
    } else if (arrivalTime > new Date(departureTime.getFullYear(), departureTime.getMonth(), departureTime.getDate(), 23, 59)) {
        arrivalTimeInput.value = '';
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const departureValue = formData.get('departure');
    const destinationValue = formData.get('destination');
    const departureTimeValue = formData.get('departureTime');
    const arrivalTimeValue = formData.get('arrivalTime');
    console.log("Submitting data:", { departure: departureValue, destination: destinationValue, departureTime: departureTimeValue, arrivalTime: arrivalTimeValue });

    try {
        const url = `http://api.fhgr-informatik.ch/get_routes?Abfahrtsort=${encodeURIComponent(departureValue)}&Ankunftsort=${encodeURIComponent(destinationValue)}&Abfahrtszeit=${encodeURIComponent(departureTimeValue)}&Ankunftszeit=${encodeURIComponent(arrivalTimeValue)}&max_waiting_time=15`;
        const response = await fetch(url);
        const result = await response.json();
        console.log("Form submission successful:", result);
        displayData(result);
    } catch (error) {
        console.log("Error during form submission:", error);
    }
});

async function fetchStations(query) {
    const url = `https://transport.opendata.ch/v1/locations?query=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.stations || [];
    } catch (error) {
        console.log("Error fetching stations:", error);
        return [];
    }
}

async function handleInput(event, element, suggestionsElement) {
    const query = element.value.trim();
    if (query.length >= 2) {
        const stations = await fetchStations(query);
        console.log("Suggestions for", query, stations);
        suggestionsElement.innerHTML = '';
        stations.forEach(station => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = station.name;
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.addEventListener('click', () => {
                element.value = station.name;
                suggestionsElement.innerHTML = '';
            });
            suggestionsElement.appendChild(suggestionItem);
        });
    } else {
        suggestionsElement.innerHTML = '';
    }
}

departure.addEventListener('input', (event) => handleInput(event, departure, suggestionsDeparture));
arrival.addEventListener('input', (event) => handleInput(event, arrival, suggestionsDestination));

function displayData(data) {
    container.innerHTML = '';
    if (!data || !data.best_routes) {
        container.innerHTML = '<p>No routes found.</p>';
        return;
    }

    data.best_routes.forEach((route, routeIndex) => {
        const first = route[0];
        const last = route[route.length - 1];

        const routeContainer = document.createElement('a');
        routeContainer.href = `route.html?route=${routeIndex}`;
        routeContainer.classList.add('route');

        routeContainer.innerHTML = `
        <div class="title">
            <p>${first.from} → ${last.to}</p>
            <p>${first.type}</p>
        </div>
        <div class="route-info">
            <p>Abfahrt:</p>
            <div class="departure">
                <p>${first.from}</p>
                <p class="pTrack">Gleis: ${first.from_platform}</p>
                <p class="time">${first.departure}</p>
            </div>
            <svg width="308" height="2" viewBox="0 0 308 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="1" x2="308" y2="1" stroke="black" stroke-width="2"/>
            </svg>
            <p>Ankunft:</p>
            <div class="arrival">
                <p>${last.to}</p>
                <p class="pTrack">Gleis: ${last.to_platform}</p>
                <p class="time">${last.arrival}</p>
            </div>
        </div>
        <button class="show-details">Reise Öffnen</button>
        `;

        container.appendChild(routeContainer);
    });
}
