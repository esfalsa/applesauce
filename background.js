chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "load-index") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["logic.js"],
      },
      sendResponse("success")
    );
  } else if (request === "load-error") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["error.js"],
      },
      sendResponse("success")
    );
  } else if (request === "open-options") {
    chrome.runtime.openOptionsPage(() => {
      sendResponse("success");
    });
  }

  fetch(
    "https://raw.githubusercontent.com/esfalsa/applesauce/main/manifest.json"
  )
    .then((response) => response.json())
    .then(({ disabled }) => {
      if (disabled || chrome.runtime.getManifest().disabled) {
        chrome.tabs.create({
          url: "disabled.html",
        });
        chrome.tabs.remove(sender.tab.id);
      }
    });
});

chrome.action.onClicked.addListener(async () => {
  let tabs = await chrome.tabs.query({
    url: "*://*.nationstates.net/template-overall=none/page=blank/applesauce*",
  });

  if (!tabs?.length) {
    chrome.tabs.create({
      url: "https://www.nationstates.net/template-overall=none/page=blank/applesauce",
    });
  } else {
    chrome.tabs.update(tabs[0].id, { active: true });
  }
});

fetch("https://raw.githubusercontent.com/esfalsa/applesauce/main/manifest.json")
  .then((response) => response.json())
  .then(({ version, disabled }) => {
    if (disabled || chrome.runtime.getManifest().disabled) {
      chrome.tabs.create({
        url: "disabled.html",
      });
    } else if (version !== chrome.runtime.getManifest().version) {
      chrome.tabs.create({
        url: `update.html?latest=${version}&current=${
          chrome.runtime.getManifest().version
        }`,
      });
    }
  });
