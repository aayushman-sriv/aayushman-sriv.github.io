(() => {
  const data = window.PORTFOLIO_DATA;
  if (!data) return;

  const modelViewerEl = document.getElementById("modelViewer");
  const modelSelect = document.getElementById("modelSelect");
  const modelDetails = document.getElementById("modelDetails");
  const viewerTitle = document.getElementById("viewerTitle");
  const viewerFrame = document.getElementById("viewerFrame");
  const viewerFallback = document.getElementById("viewerFallback");
  const fallbackTitle = document.getElementById("fallbackTitle");
  const fallbackText = document.getElementById("fallbackText");
  const rotateToggle = document.getElementById("rotateToggle");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const resetCamera = document.getElementById("resetCamera");
  let THREE;
  let OrbitControlsCtor;
  let loader;

  const modelPalette = [
    0x6fb1d8,
    0xd7aa4f,
    0x78bd96,
    0xc9836d,
    0x9da3d7,
    0xc9c19a,
    0x69b9c9,
    0xbb8d4a,
  ];

  let activeModelId = data.models?.[0]?.id || "";
  let activeFieldOfView = 32;
  let mainViewer;
  let viewerReady = false;

  class GlbViewer {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(options.fov || 32, 1, 0.01, 10000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.controls = new OrbitControlsCtor(this.camera, this.renderer.domElement);
      this.model = null;
      this.center = new THREE.Vector3();
      this.distance = 8;
      this.isVisible = true;
      this.lightTarget = new THREE.Object3D();

      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = options.exposure || 1.05;
      this.renderer.domElement.setAttribute("aria-hidden", "true");
      this.container.appendChild(this.renderer.domElement);
      this.bindInteractionCue();

      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.autoRotateSpeed = 1.25;
      this.controls.enablePan = false;
      this.controls.screenSpacePanning = false;
      this.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;

      this.addLights();
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
      this.visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          this.isVisible = entry.isIntersecting;
        },
        { rootMargin: "260px" },
      );
      this.visibilityObserver.observe(this.container);
      this.resize();
      this.renderer.setAnimationLoop(() => this.render());
    }

    bindInteractionCue() {
      const frame = this.container.closest(".viewer-frame, .mini-viewer-frame");
      if (!frame) return;

      const markInteracted = () => frame.classList.add("has-interacted");
      this.renderer.domElement.addEventListener("pointerdown", markInteracted, { once: true });
      this.renderer.domElement.addEventListener("wheel", markInteracted, { once: true, passive: true });
      this.renderer.domElement.addEventListener("touchstart", markInteracted, { once: true, passive: true });
    }

    addLights() {
      this.lightTarget.position.set(0, 0, 0);
      this.scene.add(this.lightTarget);

      const ambient = new THREE.AmbientLight(0xffffff, 0.55);
      this.scene.add(ambient);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x9fb2bf, 1.45);
      this.scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffffff, 4.8);
      key.position.set(6, 9, 7);
      key.target = this.lightTarget;
      this.scene.add(key);

      const fill = new THREE.DirectionalLight(0xd9ecff, 2.1);
      fill.position.set(-7, 4, -5);
      fill.target = this.lightTarget;
      this.scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffe0b8, 2.35);
      rim.position.set(-1, 6, -8);
      rim.target = this.lightTarget;
      this.scene.add(rim);

      this.cameraLight = new THREE.DirectionalLight(0xffffff, 1.45);
      this.cameraLight.target = this.lightTarget;
      this.scene.add(this.cameraLight);
    }

    load(model) {
      this.clearModel();
      this.activeDisplay = getDisplayConfig(model, this.options);
      this.renderer.toneMappingExposure = this.activeDisplay.exposure;

      loader.load(
        model.src,
        (gltf) => {
          const normalizedModel = this.normalizeModel(gltf.scene);
          this.model = normalizedModel;
          this.prepareModel(this.model, this.activeDisplay);
          this.scene.add(this.model);
          this.fitCamera("iso");
          this.options.onLoad?.(this);
        },
        undefined,
        () => this.options.onError?.(model),
      );
    }

    normalizeModel(model) {
      model.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const group = new THREE.Group();
      group.add(model);
      return group;
    }

    prepareModel(model, display) {
      let meshIndex = 0;

      model.traverse((child) => {
        if (!child.isMesh || !child.geometry) return;

        const color = getMeshColor(display, meshIndex);
        child.geometry.computeVertexNormals?.();

        child.material = new THREE.MeshStandardMaterial({
          color,
          roughness: display.roughness,
          metalness: display.metalness,
          emissive: new THREE.Color(color).multiplyScalar(0.34),
          emissiveIntensity: display.emissiveIntensity,
          flatShading: display.flatShading,
          side: THREE.DoubleSide,
        });

        const triangleCount = getTriangleCount(child.geometry);
        if (display.edgeOpacity > 0 && triangleCount <= display.maxEdgeTriangles) {
          const edges =
            display.edgeMode === "wire"
              ? new THREE.WireframeGeometry(child.geometry)
              : new THREE.EdgesGeometry(child.geometry, display.edgeThreshold);
          const lines = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: display.edgeColor,
              transparent: true,
              opacity: display.edgeOpacity,
              depthTest: true,
            }),
          );
          lines.name = "dark-edge-outline";
          lines.renderOrder = 3;
          child.add(lines);
        }

        meshIndex += 1;
      });
    }

    clearModel() {
      if (!this.model) return;
      this.scene.remove(this.model);
      this.model.traverse((child) => {
        if (child.geometry) child.geometry.dispose?.();
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose?.());
        }
      });
      this.model = null;
    }

    fitCamera(view = "iso") {
      if (!this.model) return;

      const box = new THREE.Box3().setFromObject(this.model);
      const size = box.getSize(new THREE.Vector3());
      this.center.set(0, 0, 0);
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;
      const fovRadians = THREE.MathUtils.degToRad(this.camera.fov);

      this.distance = Math.max(2, (maxDimension / (2 * Math.tan(fovRadians / 2))) * 1.35);
      this.camera.near = Math.max(0.01, maxDimension / 1000);
      this.camera.far = Math.max(1000, maxDimension * 80);
      this.camera.updateProjectionMatrix();
      this.controls.target.copy(this.center);
      this.setCameraView(view);
    }

    setCameraView(view) {
      const directions = {
        front: new THREE.Vector3(0, 0, 1),
        side: new THREE.Vector3(1, 0, 0),
        top: new THREE.Vector3(0, 1, 0),
        iso: new THREE.Vector3(1, 0.72, 1),
      };

      const direction = (directions[view] || directions.iso).normalize();
      this.camera.up.set(0, 1, 0);
      if (view === "top") this.camera.up.set(0, 0, -1);
      this.camera.position.copy(this.center).add(direction.multiplyScalar(this.distance));
      this.controls.target.copy(this.center);
      this.controls.update();
    }

    setFieldOfView(value) {
      this.camera.fov = value;
      this.camera.updateProjectionMatrix();
    }

    setAutoRotate(enabled) {
      this.controls.autoRotate = enabled;
    }

    resize() {
      const width = this.container.clientWidth || 1;
      const height = this.container.clientHeight || 1;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    }

    render() {
      if (!this.isVisible) return;
      this.controls.update();
      if (this.cameraLight) {
        this.cameraLight.position.copy(this.camera.position);
        this.lightTarget.position.copy(this.controls.target);
        this.lightTarget.updateMatrixWorld();
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  function init() {
    renderPerson();
    renderModels();
    renderContact();
    bindThemes();
    bindNavigationSpy();
    setActiveModel(activeModelId);
    document.getElementById("year").textContent = String(new Date().getFullYear());
    showFallback("3D viewer loading", "The interactive model viewer is starting.");

    loadThree()
      .then(() => {
        viewerReady = true;
        mainViewer = new GlbViewer(modelViewerEl, {
          fov: activeFieldOfView,
          exposure: 1.04,
          onLoad: hideFallback,
          onError: (model) =>
            showFallback(
              `${getModelLabel(model)} could not be loaded`,
              `${model?.src || "The selected GLB path"} was not found or could not be opened.`,
            ),
        });

        bindViewerControls();
        setActiveModel(activeModelId);
        initMiniViewers();
      })
      .catch(() => {
        showFallback(
          "3D viewer unavailable",
          "The portfolio text is still available. Refresh once, or check that the browser can load Three.js.",
        );
        showMiniFallbacks("3D previews unavailable");
      });
  }

  async function loadThree() {
    const [threeModule, loaderModule, controlsModule] = await Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/controls/OrbitControls.js"),
    ]);

    THREE = threeModule;
    OrbitControlsCtor = controlsModule.OrbitControls;
    loader = new loaderModule.GLTFLoader();
  }

  function renderPerson() {
    const person = data.person || {};
    setText("brandName", person.name);
    setText("heroTitle", person.title);
    setText("heroSummary", person.summary);

    document.getElementById("heroLinks").innerHTML = (person.links || [])
      .map((link) => {
        const classes = link.type === "primary" ? "text-button primary" : "text-button";
        return `<a class="${classes}" href="${escapeAttr(link.href)}">${escapeHtml(link.label)}</a>`;
      })
      .join("");

    document.getElementById("quickFacts").innerHTML = (person.facts || [])
      .map(
        (fact) => `
          <div>
            <dt>${escapeHtml(fact.label)}</dt>
            <dd>${escapeHtml(fact.value)}</dd>
          </div>
        `,
      )
      .join("");

    document.getElementById("aboutCopy").innerHTML = (person.about || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");

    document.getElementById("focusList").innerHTML = (person.focus || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  function renderModels() {
    modelSelect.innerHTML = (data.models || [])
      .map((model) => `<option value="${escapeAttr(model.id)}">${escapeHtml(getModelLabel(model))}</option>`)
      .join("");

    document.getElementById("modelGrid").innerHTML = (data.models || [])
      .map((model) => {
        const label = getModelLabel(model);
        const heading = getDisplayTitle(model);

        return `
          <article class="model-card">
            <div class="mini-viewer-frame">
              <div class="mini-model" data-mini-model="${escapeAttr(model.id)}" role="img" aria-label="${escapeAttr(`${label} 3D preview`)}"></div>
              <div class="interaction-cue mini-cue" role="img" aria-label="Drag to rotate interactive 3D model">
                <span class="cue-drag-path" aria-hidden="true"></span>
                <svg class="cue-cursor" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path class="cursor-fill" d="M7 3 25 21.2l-8.2 1.1 4.5 6.2-3.9 2.4-4.4-6.3L7 30V3Z" />
                </svg>
              </div>
              <div class="mini-fallback" hidden>
                <strong>Preview unavailable</strong>
                <span>Add ${escapeHtml(label)} to assets/models.</span>
              </div>
            </div>
            <div class="model-copy">
              <h3 class="file-label">${escapeHtml(heading)}</h3>
              <p>${escapeHtml(model.summary)}</p>
            </div>
            <button type="button" data-load-model="${escapeAttr(model.id)}">Open Large Viewer</button>
          </article>
        `;
      })
      .join("");

    document.querySelectorAll("[data-load-model]").forEach((button) => {
      button.addEventListener("click", () => {
        setActiveModel(button.dataset.loadModel);
        document.getElementById("showcase").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initMiniViewers() {
    const miniContainers = [...document.querySelectorAll("[data-mini-model]")];
    const loadMiniViewer = (container) => {
      if (container.dataset.viewerLoaded === "true") return;
      container.dataset.viewerLoaded = "true";

      const model = findModel(container.dataset.miniModel);
      const frame = container.closest(".mini-viewer-frame");
      const fallback = frame?.querySelector(".mini-fallback");
      const viewer = new GlbViewer(container, {
        fov: 34,
        exposure: 1.08,
        onLoad: () => {
          frame?.classList.remove("is-unavailable");
          if (fallback) fallback.hidden = true;
        },
        onError: () => {
          frame?.classList.add("is-unavailable");
          if (fallback) fallback.hidden = false;
        },
      });

      viewer.load(model);
    };

    if ("IntersectionObserver" in window) {
      const miniObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            loadMiniViewer(entry.target);
            miniObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "420px 0px" },
      );

      miniContainers.forEach((container) => miniObserver.observe(container));
    } else {
      miniContainers.forEach(loadMiniViewer);
    }
  }

  function renderContact() {
    const contact = data.contact || {};
    setText("contactIntro", contact.intro);
    document.getElementById("contactLinks").innerHTML = (contact.links || [])
      .map(
        (link) => `
          <div class="contact-link">
            <span>${escapeHtml(link.label)}</span>
            <a href="${escapeAttr(link.href)}">${escapeHtml(link.value)}</a>
          </div>
        `,
      )
      .join("");
  }

  function bindThemes() {
    const saved = localStorage.getItem("portfolio-theme");
    const preferred = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(saved || preferred);

    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.addEventListener("click", () => setTheme(button.dataset.themeOption));
    });
  }

  function setTheme(theme) {
    const validTheme = ["dark", "light", "color-safe"].includes(theme) ? theme : "dark";
    document.body.dataset.theme = validTheme;
    localStorage.setItem("portfolio-theme", validTheme);

    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeOption === validTheme));
    });
  }

  function bindNavigationSpy() {
    const links = [...document.querySelectorAll("[data-nav-link]")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        links.forEach((link) => {
          link.setAttribute("aria-current", String(link.getAttribute("href") === `#${visible.target.id}`));
        });
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
  }

  function bindViewerControls() {
    modelSelect.addEventListener("change", () => setActiveModel(modelSelect.value));

    document.querySelectorAll("[data-camera-view]").forEach((button) => {
      button.addEventListener("click", () => mainViewer?.setCameraView(button.dataset.cameraView));
    });

    rotateToggle.addEventListener("click", () => {
      if (!mainViewer) return;
      const nextState = rotateToggle.textContent === "Auto Rotate";
      mainViewer.setAutoRotate(nextState);
      rotateToggle.textContent = nextState ? "Stop Rotate" : "Auto Rotate";
    });

    zoomIn.addEventListener("click", () => setFieldOfView(activeFieldOfView - 5));
    zoomOut.addEventListener("click", () => setFieldOfView(activeFieldOfView + 5));

    resetCamera.addEventListener("click", () => {
      setFieldOfView(32);
      mainViewer?.setCameraView("iso");
    });
  }

  function setActiveModel(modelId) {
    const model = findModel(modelId) || data.models?.[0];
    if (!model) return;
    const label = getModelLabel(model);

    activeModelId = model.id;
    modelSelect.value = model.id;
    viewerTitle.textContent = getDisplayTitle(model);

    modelDetails.innerHTML = `
      <h3>Project Description</h3>
      <p>${escapeHtml(model.summary)}</p>
    `;

    if (!mainViewer) return;

    mainViewer.load(model);
    mainViewer.setAutoRotate(false);
    rotateToggle.textContent = "Auto Rotate";
    setFieldOfView(32);
    hideFallback();
  }

  function setFieldOfView(value) {
    activeFieldOfView = Math.max(20, Math.min(50, value));
    mainViewer?.setFieldOfView(activeFieldOfView);
  }

  function findModel(modelId) {
    return (data.models || []).find((model) => model.id === modelId);
  }

  function getDisplayConfig(model, options = {}) {
    const display = model?.display || {};
    return {
      colorMode: display.colorMode || "single",
      color: display.color ?? 0x6fb1d8,
      edgeOpacity: display.edgeOpacity ?? 0.28,
      edgeMode: display.edgeMode || "hard",
      edgeThreshold: display.edgeThreshold ?? 42,
      edgeColor: display.edgeColor ?? 0x233645,
      maxEdgeTriangles: display.maxEdgeTriangles ?? 20000,
      flatShading: display.flatShading ?? false,
      roughness: display.roughness ?? 0.72,
      metalness: display.metalness ?? 0.02,
      exposure: display.exposure ?? options.exposure ?? 1.18,
      emissiveIntensity: display.emissiveIntensity ?? 0.12,
    };
  }

  function getMeshColor(display, meshIndex) {
    if (display.colorMode === "assembly") {
      return modelPalette[meshIndex % modelPalette.length];
    }

    return display.color;
  }

  function getTriangleCount(geometry) {
    if (!geometry) return 0;
    if (geometry.index) return geometry.index.count / 3;
    return (geometry.attributes?.position?.count || 0) / 3;
  }

  function getModelLabel(model) {
    if (!model) return "";
    return model.fileName || model.title || String(model.src || "").split(/[\\/]/).pop() || "Untitled model";
  }

  function getDisplayTitle(model) {
    return getModelLabel(model).replace(/\.glb$/i, "");
  }

  function showFallback(title, text) {
    viewerFrame.classList.add("is-unavailable");
    viewerFallback.hidden = false;
    fallbackTitle.textContent = title;
    fallbackText.textContent = text;
  }

  function showMiniFallbacks(message) {
    document.querySelectorAll(".mini-viewer-frame").forEach((frame) => {
      const fallback = frame.querySelector(".mini-fallback");
      const fallbackTitle = fallback?.querySelector("strong");
      frame.classList.add("is-unavailable");
      if (fallbackTitle) fallbackTitle.textContent = message;
      if (fallback) fallback.hidden = false;
    });
  }

  function hideFallback() {
    viewerFrame.classList.remove("is-unavailable");
    viewerFallback.hidden = true;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && typeof value === "string") {
      element.textContent = value;
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  init();
})();
