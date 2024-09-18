function frameLoaded() {
    window.leftFrameloaded = true;
}

// Toggles right side to switch between 'none' and 'block' display on button click
function toggleRightFrame() {
    const rightFrame = document.getElementById('rightFrame');
    if (rightFrame.style.display === 'none' || rightFrame.style.display === '') {
        rightFrame.style.display = 'block';
    } else {
        rightFrame.style.display = 'none';
    }
}

// Listens to if button is clicked and executes toggleRightFrame()
window.addEventListener("message", (event) => {
    if (event.data === "toggleRightFrame") {
        toggleRightFrame();
    }
});