const rangeLookup = require('range-lookup');

let matches = null;

const makeCircularIterator = function* (arr) {
    let n = 0;

    while (true) {
        yield arr[n];
        n = (n + 1) % arr.length;
    }
};

const selectRange = (range) => {
    const s = window.getSelection();

    if (s.rangeCount > 0) {
        s.removeAllRanges();
    }

    s.addRange(range);
};

const nameOfTheDark = 'spotlight-search-dark';
const nameOfTheSpotlight = 'spotlight-search-spotlight';

const turnSpotlightTo = (x, y) => {
    const {style} = document.getElementById(nameOfTheSpotlight);
    style.left = x - 75 + 'px';
    style.top = y - 75 + 'px';
};

const closestElement = (node) => {
    while (!node.isSameNode(document)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }

        node = node.parentNode;
    }

    return node;
};

const error = () => {
    chrome.runtime.sendMessage('SPOTLIGHT_SEARCH_ERROR');
}

const revealRange = (range) => {
    if (range instanceof Range == false) {
        error();
        return;
    }

    selectRange(range);
    closestElement(range.commonAncestorContainer).scrollIntoView({
        behavior: 'instant', block: 'center', inline: 'center'
    });
    setTimeout(() => {
        // After scroll has run to completion...
        const rect = range.getBoundingClientRect();
        const relativeX = rect.x + rect.width / 2;
        const relativeY = rect.y + rect.height / 2;
        const absoluteX = window.scrollX + relativeX;
        const absoluteY = window.scrollY + relativeY;
        turnSpotlightTo(absoluteX, absoluteY);
    }, 0);
};

const lightsOff = () => {
    if (document.getElementById(nameOfTheDark) === null) {
        const dark = document.createElement('div');
        dark.id = nameOfTheDark;
        dark.style.width = document.body.scrollWidth + 'px';
        dark.style.height = document.body.scrollHeight + 'px';
        console.log(`width: ${dark.style.width}, height: ${dark.style.height}`)
        const spotlight = document.createElement('div');
        spotlight.id = nameOfTheSpotlight;
        dark.appendChild(spotlight);
        document.body.appendChild(dark);
    }
};

const lightsOn = () => {
    const dark = document.getElementById(nameOfTheDark);
    if (dark !== null) {
        dark.remove();
    }
};

const handleCommand = (message) => {
    switch (message.command) {
        case 'lights_off':
            lightsOff();
            break;
        case 'lights_on':
            lightsOn();
            break;
        case 'search':
            matches = makeCircularIterator(
                rangeLookup(message.value, {ignoreCase: true})
                    .filter(r => (r.getBoundingClientRect().width !== 0))
            );
            revealRange(matches.next().value);
            break;
        case 'next':
            revealRange(matches.next().value);
            break;
        default:
            break;
    }
};

// Tell previously injected copies of the script to remove listeners
window.postMessage('SPOTLIGHT_SEARCH_CLEANUP', '*');

// Schedule for after the MessageEvent has been dispatched
setTimeout(() => {
    // Remove listeners when instructed to do so by subsequently injected copies of the script
    window.addEventListener('message', function removeCommandHandler(event) {
        if (event.source != window) {
            return;
        }

        if (event.data == 'SPOTLIGHT_SEARCH_CLEANUP') {
            chrome.runtime.onMessage.removeListener(handleCommand);
            window.removeEventListener('message', removeCommandHandler);
        }
    });

    chrome.runtime.onMessage.addListener(handleCommand);
}, 0);
