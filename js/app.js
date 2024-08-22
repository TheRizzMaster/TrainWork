if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("./serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}


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


