if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("./serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}

let deferredPrompt;

// Listen for the `beforeinstallprompt` event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired');
    // Prevent the default prompt from showing
    e.preventDefault();
    // Store the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    document.getElementById('installButton').style.display = 'block';
});

// When the user clicks the install button
document.getElementById('installButton').addEventListener('click', () => {
    // Hide the install button
    document.getElementById('installButton').style.display = 'none';
    // Show the install prompt
    deferredPrompt.prompt();
    // Optionally handle the user response
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    });
});

const isMobile = () => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;

    // console.log(`Touch support: ${hasTouchScreen}`);
    // console.log(`Small screen: ${isSmallScreen}`);

    return hasTouchScreen && isSmallScreen;
};



const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
// console.log(`Standalone mode: ${isStandalone}`);

if (isMobile() && !isStandalone) {
    console.log("Open Modal");
    var modal = document.getElementById("downloadModal");
    modal.style.display = "block";

} else {
    console.log("No Modal needed");
}



