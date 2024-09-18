function frameLoaded() {
    window.leftFrameloaded = true;
}

function toggleRightFrame() {
    const rightFrame = document.getElementById('rightFrame');
    if (rightFrame.style.display === 'none' || rightFrame.style.display === '') {
        rightFrame.style.display = 'block';
    } else {
        rightFrame.style.display = 'none';
    }
}

// Listening for messages from the Left.html iframe
window.addEventListener("message", (event) => {
    if (event.data === "toggleRightFrame") {
        toggleRightFrame();
    }
});