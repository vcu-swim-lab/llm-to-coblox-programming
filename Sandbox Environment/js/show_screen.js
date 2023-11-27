document.addEventListener('DOMContentLoaded', (event) => {
    const executeButton = document.getElementById('execute-btn');
    const previewArea = document.getElementById('preview-area');

    executeButton.addEventListener('click', () => {
        // Toggle the display of the preview area
        previewArea.style.display = previewArea.style.display === 'block' ? 'none' : 'block';
    });
});

