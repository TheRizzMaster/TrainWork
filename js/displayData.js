// This script is for developing the frontend of the Data Display page. It may not be used in the final product.

async function getData() {
    const url = "./data/testdata.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const json = await response.json();
        displayData(json);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function displayData(data) {
    const container = document.getElementById('routes-container');

    data.best_routes.forEach((route, routeIndex) => {
        const first = route[0];
        const last = route[route.length - 1];

        const routeContainer = document.createElement('a');
        routeContainer.href = `route.html?route=${routeIndex}`; // Link to a "details" page
        routeContainer.classList.add('route');

        routeContainer.innerHTML = `
        <div class="title">
            <p>${route[0].from} → ${route[route.length - 1].to}<p>
            <p>${route[0].type}</p>
        </div>
        <div class="route-info">
            <p>Abfahrt:</p>
            <div class="departure">
                <p>${first.from}</p>
                <p>Gleis: ${first.platform}</p>
                <p>${first.departure}</p>
            </div>
            <svg width="308" height="2" viewBox="0 0 308 2" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="8.74228e-08" y1="1" x2="308" y2="1.00003" stroke="black" stroke-width="2"/>
</svg>
            <p>Ankunft:</p>
            <div class="arrival">
                <p>${last.to}</p>
                <p>Gleis: ${last.platform}</p>
                <p>${last.arrival}</p>
            </div>
        </div>
        <button class="show-details">Reise Öffnen</button>
        `;

        container.appendChild(routeContainer);
    });
}




getData();
