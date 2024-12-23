// Specify the target websites
const targetSites = ["http://www.youtube.com/*", "https://www.youtube.com/*"];

// Check if the stored variable exists
chrome.storage.sync.get(["inject"], ({ inject }) => {
    // If the variable doesn't exist, set it to true
    if (inject === undefined) {
        chrome.storage.sync.set({ inject: true });
    }
});

// Function to insert CSS on specific tabs
function insertCSS(tabId) {
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["mycss.css"]
  });
}

// Function to remove CSS (if needed)
function removeCSS(tabId) {
  chrome.scripting.removeCSS({
    target: { tabId: tabId },
    files: ["mycss.css"]
  });
}

// Check if the variable is true when a tab is updated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Check if tab.url is in targetSites
    if (changeInfo.status === "complete" && tab.url && targetSites.some(site => new URL(tab.url).href.match(site.replace("*", ".*")))) {
        let items = await chrome.storage.sync.get('inject');
        if (items.inject == true) {
            insertCSS(tabId);
        }
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.inject) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url && targetSites.some(site => new URL(tab.url).href.match(site.replace("*", ".*")))) {
                    if (changes.inject.newValue) {
                        insertCSS(tab.id);
                    } else {
                        removeCSS(tab.id);
                    }
                }
            });
        });
    }
}
);

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get(["inject"], ({ inject }) => {
        if (inject) {
            chrome.storage.sync.set({ inject: false });
            chrome.action.setIcon({ path: "img/icon-48-off.png" });
            // Reload page
            chrome.tabs.reload(tab.id);
            // chrome.action.setBadgeBackgroundColor({ color: "green" });
            // setTimeout(() => {
            //     chrome.storage.sync.set({ inject: true });
            //     // chrome.action.setBadgeBackgroundColor({ color: null });
            // }, 5 * 1000);
        }
        else {
            chrome.storage.sync.set({ inject: true });
            // chrome.action.setBadgeBackgroundColor({ color: "red" });
            chrome.action.setIcon({ path: "img/icon-48.png" });
            // Reload page
            chrome.tabs.reload(tab.id);
        }
    });
}
);