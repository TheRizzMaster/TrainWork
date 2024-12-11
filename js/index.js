const departure = document.getElementById('departure');
const arrival = document.getElementById('destination');
const suggestionsDeparture = document.getElementById('suggestionsDeparture');
const suggestionsDestination = document.getElementById('suggestionsDestination');
const form = document.getElementById('trainForm'); // Get the form element
const departureTimeInput = document.getElementById('departureTime');
const arrivalTimeInput = document.getElementById('arrivalTime');

console.log("Index script loaded");

// Restrict departure time to not be in the past
function setMinDepartureTime() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:mm
    departureTimeInput.min = formattedDate;
}

// Restrict arrival time to be within the same day as departure and after departure
function updateArrivalTimeConstraints() {
    const departureTime = new Date(departureTimeInput.value);
    
    if (!isNaN(departureTime)) {
        // Set the minimum arrival time to be the departure time
        arrivalTimeInput.min = departureTime.toISOString().slice(0, 16);
        
        // Set the maximum arrival time to be the end of the same day as the departure
        const endOfDay = new Date(departureTime);
        endOfDay.setHours(23, 59, 59, 999);
        arrivalTimeInput.max = endOfDay.toISOString().slice(0, 16);
    }
}

// Set initial constraints when the page loads
setMinDepartureTime();

departureTimeInput.addEventListener('change', () => {
    updateArrivalTimeConstraints();
    
    // Ensure arrival time doesn't violate constraints
    const arrivalTime = new Date(arrivalTimeInput.value);
    const departureTime = new Date(departureTimeInput.value);
    
    if (arrivalTime < departureTime) {
        arrivalTimeInput.value = '';
    } else if (arrivalTime > new Date(departureTime.getFullYear(), departureTime.getMonth(), departureTime.getDate(), 23, 59)) {
        arrivalTimeInput.value = '';
    }
});

// Handle form submission using AJAX
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(form); // Collect form data
    const departureValue = formData.get('departure');
    const destinationValue = formData.get('destination');
    console.log("Submitting data:", { departure: departureValue, destination: destinationValue });

    try {
        const response = await fetch('YOUR_BACKEND_ENDPOINT', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        console.log("Form submission successful:", result);
    } catch (error) {
        console.log("Error during form submission:", error);
    }
});

// Fetch the stations from the API based on user input
//Endpoint Hier Ändern Soblad das Backend & Frontend Datenmanipulation steht
async function fetchStations(query) {
    const url = `https://transport.opendata.ch/v1/locations?query=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.stations || []; // Return the stations array or an empty array
    } catch (error) {
        console.log("Error fetching stations:", error);
        return [];
    }
}

// Function to handle input and show suggestions
async function handleInput(event, element, suggestionsElement) {
    const query = element.value.trim();
    if (query.length >= 2) { // Trigger search only if the query is longer than 2 characters
        const stations = await fetchStations(query);
        console.log("Suggestions for", query, stations);

        // Clear previous suggestions
        suggestionsElement.innerHTML = '';

        stations.forEach(station => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = station.name;
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.addEventListener('click', () => {
                element.value = station.name;
                // Clean up suggestions after selection
                suggestionsElement.innerHTML = '';
            });
            suggestionsElement.appendChild(suggestionItem);
        });

        // Ensure the suggestions are positioned right below the input field
        const rect = element.getBoundingClientRect();
        suggestionsElement.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsElement.style.left = `${rect.left + window.scrollX}px`;
        suggestionsElement.style.width = `${rect.width}px`;
    } else {
        suggestionsElement.innerHTML = '';
    }
}

// Add event listeners for the departure and arrival inputs
departure.addEventListener('input', (event) => handleInput(event, departure, suggestionsDeparture));
arrival.addEventListener('input', (event) => handleInput(event, arrival, suggestionsDestination));
