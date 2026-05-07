(() => {
  const exitPrompt = document.getElementById("exitPrompt");
  const exitPromptMessage = document.getElementById("exitPromptMessage");
  const exitPromptActions = document.getElementById("exitPromptActions");

  if (!exitPrompt || !exitPromptMessage || !exitPromptActions) return;

  let allowWebsiteClose = false;
  let allowNextUnload = false;
  let exitCloseTimer = 0;
  let closeWarningArmed = false;
  let closeTabFollowupTimer = 0;

  const closeWarningMessage = "Did you hire me yet?";
  const topEdgeThreshold = 56;
  const backButtonZoneWidth = 130;
  const chromeTabCloseZoneStart = 0;
  const chromeTabCloseZoneEnd = 360;
  const windowCloseZoneWidth = 240;
  const exitIntentCooldown = 650;
  const guardState = { portfolioExitGuard: true };
  let lastExitIntentAt = 0;

  window.PORTFOLIO_EXIT_PROMPT_READY = true;

  renderExitPrompt("question");
  bindHistoryGuard();
  bindUnloadGuard();
  bindExitIntent();

  function bindHistoryGuard() {
    if (!window.history || !window.history.pushState) return;

    const currentState = history.state && typeof history.state === "object" ? history.state : {};
    history.replaceState(Object.assign({}, currentState, { portfolioExitBase: true }), "", location.href);
    history.pushState(guardState, "", location.href);

    window.addEventListener("popstate", () => {
      if (allowWebsiteClose) return;
      showExitPrompt("question");
      history.pushState(guardState, "", location.href);
    });
  }

  function bindUnloadGuard() {
    ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
      window.addEventListener(eventName, armCloseWarning, { once: true, passive: true });
    });

    window.addEventListener("beforeunload", (event) => {
      if (allowWebsiteClose || allowNextUnload || !closeWarningArmed) return;

      window.clearTimeout(closeTabFollowupTimer);
      closeTabFollowupTimer = window.setTimeout(() => {
        if (!document.hidden && !allowWebsiteClose) showExitPrompt("question");
      }, 500);

      event.preventDefault();
      event.returnValue = closeWarningMessage;
      return closeWarningMessage;
    });

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target ? target.closest("a[href]") : null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;

      allowNextUnload = true;
      window.setTimeout(() => {
        allowNextUnload = false;
      }, 1200);
    });
  }

  function armCloseWarning() {
    closeWarningArmed = true;
  }

  function bindExitIntent() {
    document.documentElement.addEventListener("mouseleave", handleExitIntent, { passive: true });
    document.addEventListener("mouseout", handleExitIntent, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || exitPrompt.hidden) return;
      hideExitPrompt();
    });
  }

  function handleExitIntent(event) {
    if (allowWebsiteClose || !exitPrompt.hidden || !isBrowserControlExit(event)) return;

    const now = Date.now();
    if (now - lastExitIntentAt < exitIntentCooldown) return;

    lastExitIntentAt = now;
    showExitPrompt("question");
  }

  function isBrowserControlExit(event) {
    if (event.relatedTarget || event.clientY > topEdgeThreshold) return false;

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const enteredBackButtonZone = event.clientX >= 0 && event.clientX <= backButtonZoneWidth;
    const enteredChromeTabCloseZone =
      event.clientX >= chromeTabCloseZoneStart && event.clientX <= chromeTabCloseZoneEnd;
    const enteredWindowCloseZone = viewportWidth > 0 && event.clientX >= viewportWidth - windowCloseZoneWidth;

    return enteredBackButtonZone || enteredChromeTabCloseZone || enteredWindowCloseZone;
  }

  function showExitPrompt(stage) {
    renderExitPrompt(stage);
    exitPrompt.hidden = false;
    document.body.classList.add("has-exit-prompt");
    const firstButton = exitPrompt.querySelector("button");
    if (firstButton) firstButton.focus();
  }

  function hideExitPrompt() {
    exitPrompt.hidden = true;
    document.body.classList.remove("has-exit-prompt");
  }

  function renderExitPrompt(stage) {
    window.clearTimeout(exitCloseTimer);
    exitPrompt.dataset.exitMood = stage === "sad" ? "sad" : "";
    exitPromptActions.classList.toggle("is-single", stage === "woohoo" || stage === "sad");

    if (stage === "reconsider") {
      exitPromptMessage.textContent = "Please reconsider!";
      renderExitButtons([
        ["Yes", true, () => showExitPrompt("woohoo")],
        ["No", false, () => showExitPrompt("sad")],
      ]);
      return;
    }

    if (stage === "woohoo") {
      exitPromptMessage.textContent = "Woohoo";
      renderExitButtons([["Close", true, closeWebsite]]);
      return;
    }

    if (stage === "sad") {
      exitPromptMessage.textContent = "\u2639\uFE0F";
      renderExitButtons([]);
      exitCloseTimer = window.setTimeout(closeWebsite, 1100);
      return;
    }

    exitPromptMessage.textContent = "Did you hire me yet?";
    renderExitButtons([
      ["Yes", true, () => showExitPrompt("woohoo")],
      ["No", false, () => showExitPrompt("reconsider")],
    ]);
  }

  function renderExitButtons(buttons) {
    exitPromptActions.innerHTML = "";

    buttons.forEach(([label, isPrimary, onClick]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.exitPrimary = String(isPrimary);
      button.addEventListener("click", onClick);
      exitPromptActions.appendChild(button);
    });
  }

  function closeWebsite() {
    allowWebsiteClose = true;
    window.clearTimeout(closeTabFollowupTimer);

    try {
      window.open("", "_self");
      window.close();
    } finally {
      window.setTimeout(() => {
        if (!document.hidden) window.location.href = "about:blank";
      }, 180);
    }
  }
})();
