document.documentElement.lang = "en";

document.insertBefore(
  document.implementation.createDocumentType("html", "", ""),
  document.documentElement
);

async function loadPage() {
  let user = (await chrome.storage.sync.get("userAgent")).userAgent;

  if (user) {
    globalThis.userAgent = `Script: Applesauce; User: ${
      (await chrome.storage.sync.get("userAgent")).userAgent
    }; Script author: Esfalsa`;

    let [head, body] = await Promise.all([
      (await fetch(chrome.runtime.getURL("/head.html"))).text(),
      (await fetch(chrome.runtime.getURL("/body.html"))).text(),
    ]);

    document.head.insertAdjacentHTML("afterbegin", head);
    document.body.insertAdjacentHTML("afterbegin", body);

    chrome.runtime.sendMessage("load-index");
  } else {
    let error = await fetch(chrome.runtime.getURL("/error.html"));
    let html = await error.text();

    document.body.insertAdjacentHTML("afterbegin", html);

    chrome.runtime.sendMessage("load-error");
  }
}

loadPage();
