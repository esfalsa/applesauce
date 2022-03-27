function saveSettings() {
  chrome.storage.sync.set(
    { userAgent: document.querySelector("#user-agent").value },
    () => {
      var save = document.querySelector("#save");
      save.disabled = true;
      save.textContent = "Saved!";
      setTimeout(function () {
        save.textContent = "Save";
        save.disabled = false;
      }, 750);
    }
  );
}

function loadSettings() {
  chrome.storage.sync.get(["userAgent"], function (result) {
    if (result.userAgent) {
      document.querySelector("#user-agent").value = result.userAgent;
    }
  });
}
document.addEventListener("DOMContentLoaded", loadSettings);
document.querySelector("#save").addEventListener("click", saveSettings);
