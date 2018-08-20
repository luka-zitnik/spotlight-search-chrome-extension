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

chrome.runtime.connect();
