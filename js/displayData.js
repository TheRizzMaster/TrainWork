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
            <h3>Route ${routeIndex + 1}</h3>
            <p><strong>From:</strong> ${first.from} <strong>(${first.departure})</strong> to <strong>${last.to}</strong> <strong>(${last.arrival})</strong></p>
        `;

        container.appendChild(routeContainer);
    });
}




getData();
