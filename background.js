const lightsOff = () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const value = null;
        const command = 'lights_off';
        chrome.tabs.sendMessage(tabs[0].id, {value, command});
    });
};

const lightsOn = () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const value = null;
        const command = 'lights_on';
        chrome.tabs.sendMessage(tabs[0].id, {value, command});
    });
};

chrome.runtime.onConnect.addListener(function (externalPort) {
    externalPort.onDisconnect.addListener(function () {
        lightsOn();
    });
    lightsOff();
});
