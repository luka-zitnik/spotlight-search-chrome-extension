const form = document.querySelector('form');
const input = document.querySelector('input');

let prevInputValue;

form.addEventListener('submit', (e) => {
    e.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const {value} = input;
        const command = value == prevInputValue ? 'next' : 'search';
        chrome.tabs.sendMessage(tabs[0].id, {value, command});
        prevInputValue = value;
    });
});

chrome.runtime.onMessage.addListener((message) => {
    switch (message) {
        case 'SPOTLIGHT_SEARCH_ERROR':
            input.setCustomValidity('Search error');
            break;
        default:
            break;
    }
});

input.addEventListener('change', (e) => {
    input.setCustomValidity('');
});

input.addEventListener('keydown', (e) => {
    if (e.code == 'Escape') {
        window.close();
    }
});

chrome.runtime.connect();
