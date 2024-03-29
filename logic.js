let nations;
let localid;
let currentNation;

const loaderCollapse = new bootstrap.Collapse(
  document.querySelector("#loaderCollapse"),
  { toggle: false }
);
const endorserCollapse = new bootstrap.Collapse(
  document.querySelector("#endorserCollapse"),
  { toggle: false }
);

const params = new URL(window.location).searchParams;

disableSubmit();

(async () => {
  [currentNation, localid] = await getLocalId();
  enableSubmit();
})();

if (params.has("nation")) {
  document.querySelector("#nation").value = params.get("nation");
} else if (params.has("region")) {
  document.querySelector("#region").value = params.get("region");
} else if (params.has("nations")) {
  let sep = params.has("separator") ? params.get("separator") : ",";
  document.querySelector("#nations").value = params.get("nations");
  document.querySelector("#separator").value = sep;
  loadManual(params.get("nations"), sep);
}

document.querySelector("#sort-new").checked = params.get("reverse") === "true";
document.querySelector("#sort-old").checked = params.get("reverse") !== "true";

async function fetchNS(pathname, options) {
  const userclick = Date.now();

  // identify script in URL parameters since Chromium silently drops User-Agent header
  // https://bugs.chromium.org/p/chromium/issues/detail?id=571722
  let resource = new URL(pathname, "https://www.nationstates.net");

  // userAgent injected into globalThis (see loader.js)
  resource.searchParams.append("User-Agent", userAgent);
  resource.searchParams.append("userclick", userclick);

  const response = await fetch(resource, {
    ...options,
    headers: {
      "User-Agent": userAgent,
      userclick: userclick,
    },
  });
  const text = await response.text();

  return text;
}

async function getLocalId() {
  const text = await fetchNS("/template-overall=none/page=create_region");

  return [
    text.match(/(?<=<span class="nnameblock">).*(?=<\/span>)/g)[0],
    text.match(/(?<=<input type="hidden" name="localid" value=").*(?=">)/g)[0],
  ];
}

function load(id, nats = []) {
  if (nats?.length) {
    nations = nats;
    localid = id;

    loaderCollapse.hide();
    endorserCollapse.show();

    document.querySelector("#endorse").disabled = false;

    log("success", `Loaded ${nations.length} nations.`);
  } else {
    log("error", `Could not load nations: no nations entered.`);
  }
}

async function loadNation(nation, reverse = false) {
  if (!nation) {
    return false;
  }

  disableSubmit();

  let nats = await getNationCross(nation);

  nats = nats.filter(
    (n) => n.replaceAll("_", " ").toLowerCase() !== currentNation.toLowerCase()
  );

  load(localid, reverse ? nats.reverse() : nats);

  enableSubmit();
}

async function getNationCross(nation) {
  const html = await fetchNS(`/template-overall=none/nation=${nation}`);

  const doc = new DOMParser().parseFromString(html, "text/html");
  let nats = [nation];

  doc
    .querySelectorAll("div.unbox a.nlink span.nnameblock")
    .forEach((endorser) => {
      nats.push(endorser.textContent);
    });

  return nats;
}

async function loadRegion(region, reverse = false) {
  if (!region) {
    return false;
  }

  disableSubmit();

  let admitted = await getRegionCross(region);

  admitted = admitted.filter(
    (n) => n.replaceAll("_", " ").toLowerCase() !== currentNation.toLowerCase()
  );

  load(localid, reverse ? admitted.reverse() : admitted);

  enableSubmit();
}

async function getRegionCross(region) {
  const html = await fetchNS(
    `/page=ajax2/a=reports/view=region.${region}/filter=member`
  );

  const happenings = new DOMParser()
    .parseFromString(html, "text/html")
    .querySelectorAll("li[id^=happening-]");

  let processed = [];
  let admitted = [];

  happenings.forEach((happening) => {
    let nation = happening.querySelector("a.nlink").textContent;
    let text = happening.textContent;

    if (!processed.includes(nation)) {
      if (text.includes("resigned from the World Assembly.")) {
        processed.push(nation);
      } else if (text.includes("was admitted to the World Assembly.")) {
        admitted.push(nation);
        processed.push(nation);
      }
    }
  });

  return admitted;
}

async function loadManual(nats, sep = ",", reverse = false) {
  if (!nats) {
    return false;
  }

  disableSubmit();

  nats = nats.split(sep).map((item) => item.trim());

  nats = nats.filter(
    (n) => n.replaceAll("_", " ").toLowerCase() !== currentNation.toLowerCase()
  );

  load(localid, reverse ? nats.reverse() : nats);

  enableSubmit();
}

function disableSubmit() {
  document.querySelector("#manualSubmit").disabled = true;
  document.querySelector("#nationSubmit").disabled = true;
  document.querySelector("#regionSubmit").disabled = true;
}

function enableSubmit() {
  document.querySelector("#manualSubmit").disabled = false;
  document.querySelector("#nationSubmit").disabled = false;
  document.querySelector("#regionSubmit").disabled = false;
}

document.querySelector("#endorse").addEventListener("click", () => {
  if (nations?.length) {
    endorse(nations[0], localid);
  } else {
    completeEndorsements();
  }
});

document.querySelector("#save").addEventListener("click", saveProgress);

function endorse(nation, localid) {
  document.querySelector("#endorse").disabled = true;

  const data = new URLSearchParams({
    nation: nation.replaceAll(" ", "_").toLowerCase(),
    localid: localid,
    action: "endorse",
  }).toString();

  fetchNS(`/cgi-bin/endorse.cgi?${data.toString()}`).then((text) => {
    document.querySelector("#endorse").disabled = false;
    nations.shift();
    let error = text.match(/(?<=<p class="error">\n).*(?=\n<p>)/gms);
    if (error) {
      log("error", `${nation}: ${error}`);
    } else {
      log("success", `${nation}`);
    }
    if (!nations?.length) {
      completeEndorsements();
    }
  });
}

function log(type, text) {
  let typeClass = "text-info";

  switch (type) {
    case "success":
      typeClass = "text-success";
      break;
    case "error":
      typeClass = "text-danger";
      break;
  }

  let label = document.createElement("span");
  label.classList.add(typeClass);
  label.textContent = `[${type}]`;

  let container = document.createElement("samp");
  container.append(label);
  container.append(document.createTextNode(" " + text));
  container.append(document.createElement("br"));

  document.querySelector("#log").prepend(container);
}

function saveProgress() {
  document.querySelector("#save").classList.add("disabled");
  let url = new URL(window.location.origin + window.location.pathname);
  if (nations?.length > 0) {
    url.searchParams.append("nations", nations);
    url.searchParams.append("separator", ",");
  }
  navigator.clipboard.writeText(url).then(() => {
    let orig = document.querySelector("#save").textContent;
    document.querySelector("#save").textContent = "Copied!";
    setTimeout(() => {
      document.querySelector("#save").textContent = orig;
      document.querySelector("#save").classList.remove("disabled");
    }, 1000);
  });
}

function completeEndorsements() {
  log("info", `Endorsements completed.`);
  document.querySelector("#endorse").disabled = true;
  nations = localid = undefined;
}

document.querySelector("#manualSubmit").addEventListener("click", submitManual);
document.querySelector("#nations").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.querySelector("#nations").blur();
    document.querySelector("#manualSubmit").click();
  }
});

function submitManual() {
  let nats = document.querySelector("#nations").value;
  let sep = document.querySelector("#separator").value;

  if (sep) {
    loadManual(nats, sep);
  } else {
    loadManual(nats);
  }
}

document.querySelector("#nationSubmit").addEventListener("click", submitNation);
document.querySelector("#nation").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    document.querySelector("#nation").blur();
    document.querySelector("#nationSubmit").click();
  }
});

function submitNation() {
  loadNation(
    document.querySelector("#nation").value,
    document.querySelector("input[name='order']:checked").value === "new"
  );
}

document.querySelector("#regionSubmit").addEventListener("click", submitRegion);
document.querySelector("#region").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    document.querySelector("#region").blur();
    document.querySelector("#regionSubmit").click();
  }
});

function submitRegion() {
  loadRegion(
    document.querySelector("#region").value,
    document.querySelector("input[name='order']:checked").value === "old"
  );
}
