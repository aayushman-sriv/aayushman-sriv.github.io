(function () {
  const data = window.PORTFOLIO;
  if (!data) return;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");

  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  // Header content
  const p = data.person;
  if (p) {
    setText("headlineKicker", p.kicker);
    setText("headlineTitle", p.title);
    setText("headlineSummary", p.summary);

    setText("factLocation", p.facts?.location);
    setText("factInterests", p.facts?.interests);
    setText("factAvailability", p.facts?.availability);

    renderList("highlightsList", p.highlights, (item) => `<li>${escapeHtml(item)}</li>`);
    renderLinks("topLinks", p.links);
  }

  // Projects
  renderProjects("projectsGrid", data.projects || []);

  // Experience
  renderExperience("experienceStack", data.experience || []);

  // Skills
  renderSkills("skillsGrid", data.skills || []);

  // Contact
  renderContact("contactGrid", data.contact || []);

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && typeof text === "string") el.textContent = text;
  }

  function renderList(id, items, renderItem) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = (items || []).map(renderItem).join("");
  }

  function renderLinks(id, links) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = (links || [])
      .map((l) => `<a href="${escapeAttr(l.href)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`)
      .join("");
  }

  function renderProjects(id, projects) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = projects.map((proj) => {
      const img = proj.image?.src
        ? `<img class="proj-img" src="${escapeAttr(proj.image.src)}" alt="${escapeAttr(proj.image.alt || proj.title)}" loading="lazy" />`
        : "";

      const model = proj.model3d?.src
        ? `
          <model-viewer
            class="proj-model"
            src="${escapeAttr(proj.model3d.src)}"
            alt="${escapeAttr(proj.model3d.alt || proj.title)}"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="0.7"
            exposure="1.0"
            environment-image="neutral"
            style="height:${Number(proj.model3d.heightPx || 320)}px;"
          ></model-viewer>
        `
        : "";

      const bullets = (proj.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
      const tags = (proj.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("");
      const actions = (proj.links || [])
        .map((lnk) => {
          const style = lnk.style === "ghost" ? "ghost" : lnk.style === "outline" ? "outline" : "";
          return `<a class="btn small ${style}" href="${escapeAttr(lnk.href)}" target="_blank" rel="noopener">${escapeHtml(lnk.label)}</a>`;
        })
        .join("");

      return `
        <article class="card project">
          <div class="card-top">
            <h3>${escapeHtml(proj.title)}</h3>
            <p class="meta">${escapeHtml(proj.meta || "")}</p>
          </div>

          ${model || img}

          <p>${escapeHtml(proj.summary || "")}</p>
          <ul class="bullets">${bullets}</ul>
          <div class="tags">${tags}</div>
          <div class="card-actions">${actions}</div>
        </article>
      `;
    }).join("");
  }

  function renderExperience(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.map((x) => {
      const bullets = (x.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
      return `
        <div class="card">
          <h3>${escapeHtml(x.role || "")}</h3>
          <p class="meta">${escapeHtml(x.meta || "")}</p>
          <ul class="bullets">${bullets}</ul>
        </div>
      `;
    }).join("");
  }

  function renderSkills(id, cats) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = cats.map((c) => {
      const items = (c.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("");
      return `
        <div class="card">
          <h3>${escapeHtml(c.category || "")}</h3>
          <ul class="bullets compact">${items}</ul>
        </div>
      `;
    }).join("");
  }

  function renderContact(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.map((c) => {
      return `
        <div>
          <p class="meta">${escapeHtml(c.label || "")}</p>
          <p><a href="${escapeAttr(c.href || "#")}">${escapeHtml(c.value || "")}</a></p>
        </div>
      `;
    }).join("");
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("`", "&#096;");
  }
})();
