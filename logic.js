let nations;
let localid;

const loaderCollapse = new bootstrap.Collapse(
  document.querySelector("#loaderCollapse"),
  { toggle: false }
);
const endorserCollapse = new bootstrap.Collapse(
  document.querySelector("#endorserCollapse"),
  { toggle: false }
);

const params = new URL(window.location).searchParams;

const fetchOptions = {
  headers: {
    "User-Agent": userAgent,
    get userclick() {
      return Date.now();
    },
  },
};

const paramOptions = new URLSearchParams(fetchOptions.headers);

if (params.has("nation")) {
  document.querySelector("#nation").value = params.get("nation");
  loadNation(params.get("nation"), params.has("reverse"));
} else if (params.has("region")) {
  document.querySelector("#region").value = params.get("region");
  loadRegion(params.get("region"), params.has("reverse"));
} else if (params.has("nations")) {
  let sep = params.has("separator") ? params.get("separator") : ",";
  document.querySelector("#nations").value = params.get("nations");
  document.querySelector("#separator").value = sep;
  loadManual(params.get("nations"), sep);
}

async function getLocalId() {
  const endpoint = new URL(
    "https://www.nationstates.net/template-overall=none/page=create_region"
  );
  endpoint.search = paramOptions;
  let response = await fetch(endpoint, fetchOptions);
  let text = await response.text();

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

  let [nats, [nat, localid]] = await Promise.all([
    getNationCross(nation),
    getLocalId(),
  ]);

  nats = nats.filter(
    (n) => n.replace("_", " ").toLowerCase() !== nat.toLowerCase()
  );

  load(localid, reverse ? nats.reverse() : nats);

  enableSubmit();
}

async function getNationCross(nation) {
  let endpoint = new URL(
    `https://www.nationstates.net/template-overall=none/nation=${nation}`
  );
  endpoint.search = paramOptions;

  const response = await fetch(endpoint, fetchOptions);
  const html = await response.text();

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

  let [admitted, [nat, localid]] = await Promise.all([
    getRegionCross(region),
    getLocalId(),
  ]);

  admitted = admitted.filter(
    (n) => n.replace("_", " ").toLowerCase() !== nat.toLowerCase()
  );

  load(localid, reverse ? admitted.reverse() : admitted);

  enableSubmit();
}

async function getRegionCross(region) {
  let endpoint = new URL(
    `https://www.nationstates.net/page=ajax2/a=reports/view=region.${region}/filter=member`
  );
  endpoint.search = paramOptions;

  const response = await fetch(endpoint, fetchOptions);
  const html = await response.text();

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

  let [nat, localid] = await getLocalId();

  nats = nats.filter(
    (n) => n.replace("_", " ").toLowerCase() !== nat.toLowerCase()
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

  let url = new URL("https://www.nationstates.net/cgi-bin/endorse.cgi");
  url.search = new URLSearchParams({
    nation: nation,
    localid: localid,
    action: "endorse",
    ...Object.fromEntries(paramOptions),
  }).toString();

  fetch(url, fetchOptions)
    .then((response) => response.text())
    .then((text) => {
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
    submitManual();
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
    submitNation();
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
    submitRegion();
  }
});

function submitRegion() {
  loadRegion(
    document.querySelector("#region").value,
    document.querySelector("input[name='order']:checked").value === "old"
  );
}
