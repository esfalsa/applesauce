chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "load-index") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["logic.js"],
      },
      sendResponse("success")
    );
    return true;
  } else if (request === "load-error") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["error.js"],
      },
      sendResponse("success")
    );
    return true;
  } else if (request === "open-options") {
    chrome.runtime.openOptionsPage(() => {
      sendResponse("success");
    });
  }
});
