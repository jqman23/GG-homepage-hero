  /* ROTATING WORD LOGIC (UNCHANGED) */
  const words = ["imagination","innovation","global transformation","collaboration"];
  const rotating = document.getElementById("rotatingWord");
  const ghost = document.getElementById("ghost");
  ghost.textContent = "global transformation";

  let i = 0;
  rotating.textContent = words[0];
  rotating.style.animation = "wipeInVertical 0.8s ease forwards";

  function cycle() {
    rotating.style.animation = "wipeOutVertical 0.6s ease forwards";
    setTimeout(() => {
      i = (i + 1) % words.length;
      rotating.textContent = words[i];
      rotating.style.animation = "wipeInVertical 0.8s ease forwards";
    }, 600);
  }
  setInterval(cycle, 3000);

  /* =========================
     CLICK TRACKING (ONE PER SESSION)
     ========================= */
  let visitorIP = '', visitorCountry = '', visitorState = '', visitorCity = '';

  // Same geo provider as your working widget
  fetch('https://geolocation-db.com/json/')
    .then(res => res.json())
    .then(data => {
      visitorIP      = data.IPv4         || '';
      visitorCountry = data.country_name || '';
      visitorState   = data.state        || '';
      visitorCity    = data.city         || '';
    })
    .catch(() => {});

  const TRACKING_BASE =
    "https://script.google.com/macros/s/AKfycbxq8HofSFbnFxS7HeKQKZVhyuPIqpu_7NAWhvOzAXBzyxfatdeJu8hfGCRCahOINshA/exec";

  function trackHeroClick(buttonName) {
    const sessionKey = `${buttonName}_tracked`;

    // Only send once per browser session per button
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    const params = new URLSearchParams({
      sheet:   "2026Registration",
      button:  buttonName,
      ip:      visitorIP,
      country: visitorCountry,
      state:   visitorState,
      city:    visitorCity
    });

    fetch(`${TRACKING_BASE}?${params.toString()}`, {
      mode: "no-cors",
      keepalive: true
    }).catch(() => {});
  }

  function trackVideoClick() {
    trackHeroClick("Hero_Image_BrandVideo");
  }

  function trackRegisterClick() {
    trackHeroClick("Hero_Image_RegisterNow");
  }

  /* REGISTRATION CTA */
  const registerBtn = document.getElementById("registerCta");

  if (registerBtn) {
    registerBtn.addEventListener("click", trackRegisterClick);
  }

  /* VIDEO OPEN / CLOSE */
  const openBtn = document.getElementById("titleIconLink");
  const overlay = document.getElementById("videoOverlay");
  const iframe = overlay.querySelector("iframe");
  const closeBtn = document.getElementById("closeVideo");

  const VIDEO_SRC = "https://www.youtube.com/embed/MuINCXtjuTk?autoplay=1&rel=0";

  openBtn.addEventListener("click", () => {
    trackVideoClick();         // ✅ sends ip/country/state/city too (once per session)
    iframe.src = VIDEO_SRC;
    overlay.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    iframe.src = "";
    overlay.classList.remove("active");
  });

  function forceCloseVideoIfMobile() {
    if (window.matchMedia("(max-width: 768px)").matches) {
      iframe.src = "";
      overlay.classList.remove("active");
    }
  }
  window.addEventListener("resize", forceCloseVideoIfMobile);
  forceCloseVideoIfMobile();

  /* =========================
     AUTO-HEIGHT: report our true, font-settled height to the parent
     (parent listens for e.data.ggWidgetHeight)
     - First report waits for Montserrat so there's no post-swap reflow bump.
     - Reports are coalesced to one per animation frame and a >1px dead-band,
       so the width<->height resize loop doesn't spam the parent.
     ========================= */
  var lastH = 0, rafId = 0;

  function measureAndPost() {
    rafId = 0;
    var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
    if (Math.abs(h - lastH) <= 1) return;   // ignore sub-pixel jitter
    lastH = h;
    parent.postMessage({ ggWidgetHeight: h }, "*");
  }

  function schedulePost() {
    if (!rafId) rafId = requestAnimationFrame(measureAndPost);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedulePost);   // first report after Montserrat is loaded
  } else {
    window.addEventListener("load", schedulePost);
  }
  if (window.ResizeObserver) {
    new ResizeObserver(schedulePost).observe(document.body);
  } else {
    window.addEventListener("resize", schedulePost);
  }
