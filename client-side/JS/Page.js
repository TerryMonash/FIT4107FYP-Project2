const toggleButton = document.getElementById('toggleRightBtn');
const rightFrame = document.getElementById('rightFrame');

toggleButton.addEventListener('click', function() {
    if (rightFrame.classList.contains('hidden')) {
        rightFrame.classList.remove('hidden');
        toggleButton.textContent = 'Hide Adaptive UI';
    } else {
        rightFrame.classList.add('hidden');
        toggleButton.textContent = 'Show Adaptive UI';
    }
});