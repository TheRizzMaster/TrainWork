// Get references to DOM elements
const departure = document.getElementById('departure');
const arrival = document.getElementById('destination');
const suggestionsDeparture = document.getElementById('suggestionsDeparture');
const suggestionsDestination = document.getElementById('suggestionsDestination');
const form = document.getElementById('trainForm'); // Get the form element
const departureTimeInput = document.getElementById('departureTime');
const arrivalTimeInput = document.getElementById('arrivalTime');
const container = document.getElementById('routes-container');
let loading = false;

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
        await playLoadingAnimation();
        const url = `https://trainwork.app/api/fetchRoutes.php?Abfahrtsort=${encodeURIComponent(departureValue)}&Ankunftsort=${encodeURIComponent(destinationValue)}&Abfahrtszeit=${encodeURIComponent(departureTimeValue)}&Ankunftszeit=${encodeURIComponent(arrivalTimeValue)}&max_waiting_time=15`;
        const response = await fetch(url, { method: 'GET' });
        const result = await response.json();
        // Save results to localStorage
        stopLoadingAnimation();
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

let loadingTextInterval = null;

// List of messages to display while loading
const loadingMessages = [
    "Algorithmus sucht die perfekte Route...",
    "Optimierung des Gleisnetzwerks läuft...",
    "Rekursion im Schienennetz gestartet...",
    "Kürzeste Route wird berechnet...",
    "Dijkstra kämpft mit den Gleisen...",
    "Prim-Algorithmus legt Weichen...",
    "A* findet den schnellsten Bahnhof...",
    "Schienenbaum wird sortiert...",
    "Algorithmus löst Gleiskonflikte...",
    "Route wird mit KI vorhergesagt...",
    "Virtuelle Schienenpfade werden geprüft...",
    "Deep Learning für Weichenstellung...",
    "Fehlende Gleisdaten werden interpoliert...",
    "Künstliche Intelligenz trainiert Züge...",
    "Neuralnetz sucht nach dem besten Halt...",
    "Algorithmus wartet auf freies Gleis...",
    "Gleisdatenbank wird indexiert...",
    "Quantenalgorithmus denkt nach...",
    "Routenmatrix wird aktualisiert...",
    "Random Walk durch das Schienennetz...",
    "Heuristik sucht optimale Verbindung...",
    "Fahrplan wird durch KI angepasst...",
    "Komplexitätsanalyse der Route läuft...",
    "Algorithmus iteriert durch Waggons...",
    "Pfadfindung im Gleis-Labyrinth...",
    "Optimierungsproblem wird gelöst...",
    "Algorithmus debuggt virtuelle Züge...",
    "Datenstruktur für Schienen wird geordnet...",
    "Algorithmus minimiert Verspätungen...",
    "Algorithmus schläft noch... Kaffee wird gekocht!",
    "Dijkstra sagt: 'Bin gleich fertig!'... Vielleicht.",
    "KI sucht die Route... und nebenbei Katzenvideos.",
    "A* findet die Route, aber nur in der Theorie...",
    "Prim schiebt noch ein paar Gleise hin und her...",
    "Algorithmus fragt: 'Muss es wirklich heute sein?'",
    "Quantencomputer sucht... vielleicht in einer anderen Dimension.",
    "Routenberechnung bei 99%... oder doch erst bei 9%?",
    "Neuralnetz denkt über die Zugfarbe nach...",
    "Gleisdatenbank sagt: 'Keine Ahnung, frag später nochmal.'",
    "Algorithmus schlägt vor: 'Kann der Zug nicht einfach fliegen?'",
    "Schienenbaum hat sich verhakt... Bitte Geduld!",
    "Dijkstra hat sich verlaufen... Backup ruft an.",
    "KI simuliert... 'Was wäre, wenn der Zug ein Flugzeug wäre?'",
    "Pfadfindung kaputt... 'Haben wir überhaupt einen Pfad?'",
    "Algorithmus in der Sackgasse... Rückwärtsgang aktiv.",
    "Virtuelle Lok sucht WLAN... 'Kein Empfang im Tunnel!'",
    "Rekursion läuft... und läuft... und läuft...",
    "KI rechnet nach... 'Mist, die Strecke ist rund!'",
    "Algorithmus fragt: 'Muss ich wirklich ALLE Weichen prüfen?'",
    "Heuristik hängt bei der Frage: 'Links oder rechts?'",
    "Routenoptimierung entdeckt ein Gleis nach Hogwarts...",
    "Algorithmus debuggt... 'Warum sind Gleise dreieckig?'",
    "Virtuelles Stellwerk fragt: 'Was ist ein Zug?'",
    "Neuralnetz war hungrig... Alle Daten sind weg.",
    "Schienenmatrix explodiert... Sorry, falscher Algorithmus.",
    "KI sucht noch... hat aber Tinder geöffnet.",
    "Algorithmus wartet... auf den nächsten Algorithmus.",
    "Route wird berechnet... irgendwann. Versprochen.",
    "Lokführer KI sagt: 'Ich fahre lieber Bus.'"
  ];
  
  


// Loading animation
async function playLoadingAnimation() {
    loading = true;
    form.querySelectorAll('input').forEach(input => input.disabled = true);
    form.querySelector('button').disabled = true;
    container.innerHTML = `
    <dotlottie-player style="margin: 0 auto;" src="https://lottie.host/2f527072-35fd-47e8-8fdc-cf237f7299c8/CMQYlzKPHt.json" background="transparent" speed="1.5" style="width: 300px; height: 300px" direction="1" playMode="normal" loop autoplay></dotlottie-player>
    <p id="loading-text"></p>
    `;

    const loadingText = document.getElementById('loading-text');
    let currentIndex = 0;

    // Set the initial text
    loadingText.textContent = loadingMessages[currentIndex];

    // Every 3 seconds, update the text
    loadingTextInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      loadingText.textContent = loadingMessages[currentIndex];
    }, 3000);
}

function stopLoadingAnimation() {
    loading = false;
    container.innerHTML = '';
    form.querySelector('button').disabled = false;
    form.querySelectorAll('input').forEach(input => input.disabled = false);
}