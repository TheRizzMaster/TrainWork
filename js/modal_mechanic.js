//Modal
var modal = document.getElementById("downloadModal");

// <Span> um Modal zu schliessen
var span = document.getElementsByClassName("close")[0];

// Click auf <span>
span.onclick = function() {
    modal.style.display = "none";
}

//Modal schliessen bei click ausserhalb des Modals
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function isAppleDevice() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    return /Mac|iPhone|iPod|iPad/.test(userAgent) || /MacIntel|iPhone|iPod|iPad/.test(platform);
}

if (isAppleDevice()) {
    const appleDownload = document.getElementById("appleDownload");
    appleDownload.style.display = "block";
} else {
    console.log("User is not on an Apple device");
}
