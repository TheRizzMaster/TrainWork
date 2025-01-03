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
    if (!isNaN(departureTime)) {
        arrivalTimeInput.min = departureTime.toISOString().slice(0, 16);
        const endOfDay = new Date(departureTime);
        endOfDay.setHours(23, 59, 59, 999);
        arrivalTimeInput.max = endOfDay.getFullYear() + "-" + (endOfDay.getMonth() + 1).toString().padStart(2, '0') + "-" + endOfDay.getDate().toString().padStart(2, '0') + "T23:59";
    }
}

setMinDepartureTime();

departureTimeInput.addEventListener('change', updateArrivalTimeConstraints);

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const departureValue = formData.get('departure');
    const destinationValue = formData.get('destination');
    const departureTimeValue = formData.get('departureTime');
    const arrivalTimeValue = formData.get('arrivalTime');
    
    try {
        const url = `https://trainwork.app/api/fetchRoutes.php?Abfahrtsort=${encodeURIComponent(departureValue)}&Ankunftsort=${encodeURIComponent(destinationValue)}&Abfahrtszeit=${encodeURIComponent(departureTimeValue)}&Ankunftszeit=${encodeURIComponent(arrivalTimeValue)}&max_waiting_time=15`;
        const response = await fetch(url, { method: 'GET' });
        const result = await response.json();
        // Save results to localStorage
        localStorage.setItem('routeResults', JSON.stringify(result));
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

departure.addEventListener('input', (event) => handleInput(event, departure, suggestionsDeparture));
arrival.addEventListener('input', (event) => handleInput(event, arrival, suggestionsDestination));

async function handleInput(event, element, suggestionsElement) {
    const query = element.value.trim();
    if (query.length >= 2) {
        const stations = await fetchStations(query);
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

        // Positionierung der Vorschläge
        const rect = element.getBoundingClientRect();
        suggestionsElement.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsElement.style.left = `${rect.left + window.scrollX}px`;
        suggestionsElement.style.width = `${rect.width}px`;
    } else {
        suggestionsElement.innerHTML = '';
    }
}

// Format time string to HH:MM
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function displayData(data) {
    container.innerHTML = '';
    if (!data || !data.best_routes) {
        container.innerHTML = '<p>No routes found.</p>';
        return;
    }

    data.best_routes.forEach((route, routeIndex) => {
        const startToNearest = data.anschlussverbindungen.start_to_nearest;
        const nearestToEnd = data.anschlussverbindungen.nearest_to_end;
        
        const routeContainer = document.createElement('a');
        routeContainer.href = `route.html?route=${routeIndex}`;
        routeContainer.classList.add('route');

        routeContainer.innerHTML = `
            <div class="title">
                <p class="title-from-to">${startToNearest.from} → ${nearestToEnd.to}</p>
                <p class="title-type">${startToNearest.type.join(", ")}</p>
            </div>
            <div class="route-info">
                <div class="departure">
                    <p>${startToNearest.from}</p>
                    <p class="pTrack">Gleis: ${startToNearest.from_platform || '-'}</p>
                    <p class="time">${formatTime(startToNearest.connections[0].departure)}</p>
                </div>
                <hr>
                <div class="arrival">
                    <p>${nearestToEnd.to}</p>
                    <p class="pTrack">Gleis: ${nearestToEnd.to_platform || '-'}</p>
                    <p class="time">${formatTime(nearestToEnd.connections[0].departure)}</p>
                </div>
            </div>
        `;
        container.appendChild(routeContainer);
    });
}

// Check for existing data in localStorage and display it
const savedResults = localStorage.getItem('routeResults');
if (savedResults) {
    displayData(JSON.parse(savedResults));
}
