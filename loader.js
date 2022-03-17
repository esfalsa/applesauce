document.title = "NationStates | Applesauce";

document.documentElement.lang = "en";

let viewport = document.createElement("meta");
viewport.name = "viewport";
viewport.content = "width=device-width, initial-scale=1.0";
document.head.appendChild(viewport);

async function loadPage() {
  let index = await fetch(chrome.runtime.getURL("/index.html"));
  let html = await index.text();

  document.body.insertAdjacentHTML("afterbegin", html);

  chrome.runtime.sendMessage("load-index");
}

loadPage();