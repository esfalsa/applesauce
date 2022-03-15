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
  }
});
