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