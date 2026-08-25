// Link-a-roo — popup (the toolbar panel)
//
// This is Link-a-roo's main surface. Opening it (toolbar click or the Chrome
// shortcut) grants activeTab, so we can read the current page's selection and
// pre-fill the search box — the same "grab the highlighted text" behaviour the
// old injected widget had, without running anything on the page until asked.

(function () {
  "use strict";

  const S = globalThis.CtxStorage;
  const $ = (sel) => document.querySelector(sel);

  // Deliberately NOT "tipsDismissed" — that key belonged to the old onboarding
  // card and is on the legacy purge list, so reusing it would wipe this on the
  // next startup and hide the tip from people who never dismissed it.
  const TIP_KEY = "panelTipDismissed";

  let state = { destinations: [] };
  let tipDismissed = false;

  const termEl = $("#term");
  const destButtonsEl = $("#dest-buttons");
  const searchEmptyEl = $("#search-empty");

  // ---- Search ----

  async function search(dest) {
    // Collapse the whitespace a multi-line paste brings with it — a raw newline
    // encodes as %0A and most destinations choke on it.
    const term = termEl.value.trim().replace(/\s+/g, " ");
    if (!term) {
      termEl.classList.add("shake");
      setTimeout(() => termEl.classList.remove("shake"), 400);
      termEl.focus();
      return;
    }
    const matchDomain = dest.openMode === "new" ? "" : S.matchDomainFor(dest.urlTemplate);
    // Wait for the worker to confirm the tab opened before closing. Closing
    // the popup first destroys the sender mid-flight and the search is lost.
    try {
      await chrome.runtime.sendMessage({
        type: "OPEN_OR_REUSE_TAB",
        url: S.buildDestinationUrl(dest, term),
        matchDomain,
      });
    } catch (e) {
      console.warn("Link-a-roo: search request failed", e);
    }
    window.close();
  }

  function renderSearch() {
    destButtonsEl.innerHTML = "";
    const has = state.destinations.length > 0;
    searchEmptyEl.hidden = has;
    destButtonsEl.hidden = !has;
    $("#shortcuts-tip").hidden = !has || tipDismissed;
    termEl.disabled = !has;

    state.destinations.forEach((dest) => {
      const btn = document.createElement("button");
      btn.className = "dest-btn";
      btn.title = dest.urlTemplate || "";
      const label = document.createElement("span");
      label.textContent = dest.label || "(unnamed)";
      btn.append(label);
      btn.addEventListener("click", () => search(dest));
      destButtonsEl.appendChild(btn);
    });
  }

  // ---- Auto-growing search box ----
  //
  // The box is a textarea so a long selection or a pasted paragraph stays
  // readable instead of scrolling past inside a one-line input. It starts one
  // row tall and grows to fit, up to MAX_HEIGHT, after which it scrolls.

  const MAX_HEIGHT = 132; // ~6 lines at the popup's width

  // scrollHeight covers content + padding but not the border, and the box is
  // border-box, so the border has to be added back or the box lands 2px short
  // and shows a scrollbar it doesn't need.
  const borderY = (() => {
    const cs = getComputedStyle(termEl);
    return parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  })();

  function autoGrow() {
    termEl.style.height = "auto";
    termEl.style.height = Math.min(termEl.scrollHeight + borderY, MAX_HEIGHT) + "px";
  }

  termEl.addEventListener("input", autoGrow);

  termEl.addEventListener("keydown", (e) => {
    // Enter searches, as it did when this was an input. Shift+Enter is the
    // escape hatch for an actual newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (state.destinations.length) search(state.destinations[0]);
    }
  });

  function openSettings() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  $("#open-settings").addEventListener("click", openSettings);
  $("#empty-add").addEventListener("click", openSettings);

  // Pull the highlighted text off the active tab. Fails harmlessly on pages we
  // can't script (chrome://, the Web Store, PDFs) — the box just starts empty.
  async function prefillFromSelection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || tab.id == null) return;
      const [res] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => String(getSelection()).trim(),
      });
      if (res && res.result && !termEl.value) {
        termEl.value = res.result;
        autoGrow();
      }
    } catch (_) {
      /* not scriptable — leave the box empty */
    }
  }

  $("#shortcuts-tip-link").addEventListener("click", (e) => {
    e.preventDefault();
    openSettings();
  });

  $("#shortcuts-tip-close").addEventListener("click", () => {
    tipDismissed = true;
    chrome.storage.local.set({ [TIP_KEY]: true });
    $("#shortcuts-tip").hidden = true;
  });

  // ---- Init ----

  (async () => {
    state = await S.seedDefaultsIfEmpty();
    if (!state.destinations) state.destinations = [];
    tipDismissed = await new Promise((r) =>
      chrome.storage.local.get(TIP_KEY, (v) => r(!!v[TIP_KEY]))
    );
    renderSearch();
    if (state.destinations.length) {
      termEl.focus();
      await prefillFromSelection();
      termEl.select();
    }
  })();
})();
