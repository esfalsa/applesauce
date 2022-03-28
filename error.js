document.querySelector("#open-settings").addEventListener("click", () => {
  chrome.runtime.sendMessage("open-options");
});
