const departure = document.getElementById('departure');
const arrival = document.getElementById('destination');


// Fetch the stations from the API based on user input
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
async function handleInput(event, element) {
    const query = element.value.trim();
    if (query.length > 2) { // Trigger search only if the query is longer than 2 characters
        const stations = await fetchStations(query);
        console.log("Suggestions for", query, stations);

        // Populate the suggestions (e.g., create a dropdown below the input)
        const suggestions = document.createElement('ul');
        suggestions.className = 'suggestions';
        stations.forEach(station => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = station.name;
            suggestionItem.addEventListener('click', () => {
                element.value = station.name;
                // Clean up suggestions after selection
                if (suggestions.parentNode) {
                    suggestions.parentNode.removeChild(suggestions);
                }
            });
            suggestions.appendChild(suggestionItem);
        });

        // Remove any existing suggestions and add the new ones
        const existingSuggestions = element.parentNode.querySelector('.suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        element.parentNode.appendChild(suggestions);
    }
}

// Add event listeners for the departure and arrival inputs
departure.addEventListener('input', (event) => handleInput(event, departure));
arrival.addEventListener('input', (event) => handleInput(event, arrival));
