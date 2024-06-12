document.addEventListener('DOMContentLoaded', function() {
    const secondPageButton = document.getElementById('secondpage-button');
    if (secondPageButton) {
        secondPageButton.addEventListener('click', function() {
            window.location.href = './secondpage.html';
        });
    }

    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (typeof reset === 'function') {
                reset();
            }
        });
    }

    const mapPageButton = document.getElementById('mappage-button');
    if (mapPageButton) {
        mapPageButton.addEventListener('click', function() {
            window.location.href = './mappage.html';
        });
    }
});
