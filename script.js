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

  const TRACK_SESSION_KEY = "Hero_Image_BrandVideo_tracked";

  function trackVideoClick() {
    // Only send once per browser session
    if (sessionStorage.getItem(TRACK_SESSION_KEY)) return;
    sessionStorage.setItem(TRACK_SESSION_KEY, "1");

    const params = new URLSearchParams({
      sheet:   "2026Registration",
      button:  "Hero_Image_BrandVideo",
      ip:      visitorIP,
      country: visitorCountry,
      state:   visitorState,
      city:    visitorCity
    });

    fetch(`${TRACKING_BASE}?${params.toString()}`, { mode: "no-cors" }).catch(() => {});
  }

  /* VIDEO OPEN / CLOSE */
  const openBtn = document.getElementById("titleIconLink");
  const overlay = document.getElementById("videoOverlay");
  const iframe = overlay.querySelector("iframe");
  const closeBtn = document.getElementById("closeVideo");

  const VIDEO_SRC = "https://www.youtube.com/embed/MuINCXtjuTk?autoplay=1&rel=0";

  openBtn.addEventListener("click", () => {
    trackVideoClick();         // ✅ now sends ip/country/state/city too (once per session)
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
     AUTO-HEIGHT: tell the parent page how tall we are
     (parent listens for e.data.ggWidgetHeight)
     ========================= */
  const heroEl = document.getElementById("heroOverlay");

  function postHeight() {
    if (window.parent === window) return; // not embedded
    const h = Math.ceil(heroEl.getBoundingClientRect().height);
    window.parent.postMessage({ ggWidgetHeight: h }, "*");
  }

  // Fires whenever the hero changes size (incl. the hero image finishing load)
  if (window.ResizeObserver) {
    new ResizeObserver(postHeight).observe(heroEl);
  }
  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);
  postHeight();
