const userAgent = "Applesauce | Original script author: Esfalsa";

let nations;
let separator;
let localid;

let loc = new URL(window.location);

const loaderCollapse = new bootstrap.Collapse(
  document.querySelector("#loaderCollapse"),
  { toggle: false }
);
const endorserCollapse = new bootstrap.Collapse(
  document.querySelector("#endorserCollapse"),
  { toggle: false }
);

let params = loc.searchParams;

if (params.has("nation")) {
  document.querySelector("#nation").value = params.get("nation");
  setLocalId().then(() => {
    loadNation(params.get("nation"), params.has("reverse"));
  });
} else if (params.has("region")) {
  document.querySelector("#region").value = params.get("region");
  setLocalId().then(() => {
    loadRegion(params.get("region"), params.has("reverse"));
  });
} else if (params.has("nations")) {
  let sep = params.has("separator") ? params.get("separator") : ",";
  document.querySelector("#nations").value = params.get("nations");
  document.querySelector("#separator").value = sep;
  setLocalId().then(() => {
    loadManual(params.get("nations"), sep);
  });
} else {
  disableSubmit();

  setLocalId().then(() => {
    enableSubmit();
  });
}

function load(id, nats = [], sep = ",") {
  if (nats.length > 0) {
    nations = nats;
    separator = sep;
    localid = id;

    loaderCollapse.hide();
    endorserCollapse.show();

    document.querySelector("#endorse").disabled = false;

    log("success", `Loaded ${nations.length} nations.`);
  } else {
    log("error", `Could not load nations: no nations entered.`);
  }
}

function loadNation(nation, reverse = false) {
  disableSubmit();

  let endpoint = new URL(
    `https://www.nationstates.net/template-overall=none/nation=${encodeURIComponent(
      nation
    )}`
  );
  endpoint.search = new URLSearchParams({
    "x-useragent": userAgent,
  });

  fetch(endpoint, {
    headers: {
      "User-Agent": userAgent,
    },
  })
    .then((response) => response.text())
    .then((html) => {
      let doc = new DOMParser().parseFromString(html, "text/html");
      let nats = [nation];

      doc
        .querySelectorAll("div.unbox a.nlink span.nnameblock")
        .forEach((endorser) => {
          nats.push(endorser.textContent);
        });

      if (reverse) {
        nats = nats.reverse();
      }

      load(document.querySelector("#localid").value, nats, ",");

      enableSubmit();
    });
}

function loadRegion(region, reverse = false) {
  disableSubmit();

  let endpoint = new URL(
    `https://www.nationstates.net/page=ajax2/a=reports/view=region.${encodeURIComponent(
      region
    )}/filter=member`
  );
  endpoint.search = new URLSearchParams({
    "x-useragent": userAgent,
  });

  fetch(endpoint, {
    headers: {
      "User-Agent": userAgent,
    },
  })
    .then((response) => response.text())
    .then((html) => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      let happenings = doc.querySelectorAll("li[id^=happening-]");

      let nations = [];
      let nats = [];

      happenings.forEach((happening) => {
        let nation = happening.querySelector("a.nlink").textContent;
        let text = happening.textContent;
        if (!nations.includes(nation)) {
          nations.push(nation);

          if (
            !text.includes("applied to join the World Assembly.") &&
            !text.includes("resigned from the World Assembly.") &&
            text.includes("was admitted to the World Assembly.")
          ) {
            nats.push(nation);
          }
        }
      });

      if (reverse) {
        nats = nats.reverse();
      }

      load(document.querySelector("#localid").value, nats, ",");

      enableSubmit();
    });
}

function loadManual(nats, sep = ",", reverse = false) {
  disableSubmit();

  load(
    document.querySelector("#localid").value,
    reverse
      ? nats
          .split(sep)
          .map((item) => item.trim())
          .reverse()
      : nats.split(sep).map((item) => item.trim()),
    sep
  );

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
  if (nations[0]) {
    endorse(nations[0], localid);
  } else {
    completeEndorsements();
  }
});

document.querySelector("#refresh").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#refresh").classList.add("disabled");
  setLocalId();
});

document.querySelector("#save").addEventListener("click", saveProgress);

function endorse(nation, localid) {
  document.querySelector("#endorse").disabled = true;

  let url = new URL("https://www.nationstates.net/cgi-bin/endorse.cgi");
  url.search = new URLSearchParams({
    nation: nation,
    localid: localid,
    action: "endorse",
    "x-useragent": userAgent,
  }).toString();

  fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
  })
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
      if (!nations[0]) {
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

async function setLocalId() {
  let response = await fetch(
    `https://www.nationstates.net/template-overall=none/page=create_region?x-useragent=${encodeURIComponent(
      userAgent
    )}`,
    {
      headers: {
        "User-Agent": userAgent,
      },
    }
  );

  let text = await response.text();

  document.querySelector("#localid").value = text.match(
    /(?<=<input type="hidden" name="localid" value=").*(?=">)/g
  );
  document.querySelector("#refresh").classList.remove("disabled");
  log("success", `Fetched localid.`);
}

function saveProgress() {
  document.querySelector("#save").classList.add("disabled");
  let url = new URL(document.location.origin + document.location.pathname);
  if (nations && nations[0]) {
    url.searchParams.append("nations", nations);
  }
  if (separator) {
    url.searchParams.append("separator", separator);
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
  nations = localid = separator = undefined;
}

document.querySelector("#manualSubmit").addEventListener("click", submitManual);

document.querySelector("#nations").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    submitManual();
  }
});

function submitManual() {
  let nats = document.querySelector("#nations").value;
  let sep = document.querySelector("#separator").value;

  if (!nats) {
    return false;
  }

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
  let nation = document.querySelector("#nation").value;

  if (!nation) {
    return false;
  }

  loadNation(nation);
}

document.querySelector("#regionSubmit").addEventListener("click", submitRegion);

document.querySelector("#region").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    submitRegion();
  }
});

function submitRegion() {
  let region = document.querySelector("#region").value;

  if (!region) {
    return false;
  }

  loadRegion(region);
}
