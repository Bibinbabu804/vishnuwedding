/* ==========================================================================
   THE SACRED GARDEN — V & D
   Interaction & animation logic
   ========================================================================== */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     ENVELOPE OPENING SEQUENCE & SPARKLE ANIMATIONS
     ------------------------------------------------------------------ */
  const envelopeScreen = document.getElementById("envelope-screen");
  const envelope       = document.getElementById("envelope");
  const musicToggle     = document.getElementById("music-toggle");
  const bgAudio         = document.getElementById("bg-audio");
  const body            = document.body;

  let opened = false;

  function spawnClickSparkles(e) {
    if (reducedMotion) return;
    const stage = document.querySelector('.envelope-stage');
    if (!stage) return;

    let clickX, clickY;
    if (e && e.clientX && e.clientY) {
      const rect = stage.getBoundingClientRect();
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    } else {
      clickX = stage.offsetWidth / 2;
      clickY = stage.offsetHeight * 0.44;
    }

    const sparkleCount = 24;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'click-sparkle';

      const angle = (Math.PI * 2 * i) / sparkleCount + (Math.random() * 0.4 - 0.2);
      const distance = 70 + Math.random() * 140;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const size = 6 + Math.random() * 12;

      sparkle.style.left = clickX + 'px';
      sparkle.style.top = clickY + 'px';
      sparkle.style.width = size + 'px';
      sparkle.style.height = size + 'px';
      sparkle.style.setProperty('--tx', tx + 'px');
      sparkle.style.setProperty('--ty', ty + 'px');
      sparkle.style.animationDelay = (Math.random() * 0.15) + 's';

      stage.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1250);
    }
  }

  function openEnvelope(e) {
    if (opened) return;
    opened = true;

    spawnClickSparkles(e);
    tryStartMusic();

    envelope.classList.add("tapped");

    const flapDelay = reducedMotion ? 0 : 250;
    const popDelay = reducedMotion ? 0 : 550;
    const exitDelay = reducedMotion ? 60 : 1600;
    const doneDelay = reducedMotion ? 140 : 2200;

    setTimeout(() => envelope.classList.add("open-flap"), flapDelay);
    setTimeout(() => envelope.classList.add("card-slide"), popDelay);

    setTimeout(() => {
      envelopeScreen.classList.add("exiting");
      revealHero();
      startPetals();
    }, exitDelay);

    setTimeout(() => {
      envelopeScreen.classList.add("hide");
      body.classList.remove("locked");
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        heroEl.setAttribute("tabindex", "-1");
        heroEl.focus({ preventScroll: true });
      }
    }, doneDelay);
  }

  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      openEnvelope(e);
    }
  });
  envelope.addEventListener("touchend", (e) => {
    e.preventDefault();
    openEnvelope(e);
  }, { passive: false });

  function revealHero() {
    const heroCard = document.getElementById("hero-card");
    requestAnimationFrame(() => heroCard.classList.add("in-view"));
  }

  /* ------------------------------------------------------------------
     MUSIC TOGGLE
     ------------------------------------------------------------------ */
  let musicOn = false;

  function tryStartMusic() {
    musicToggle.classList.add("visible");
    bgAudio.volume = 0.55;
    bgAudio.play().then(() => {
      musicOn = true;
      musicToggle.classList.add("playing");
      musicToggle.setAttribute("aria-pressed", "true");
    }).catch((err) => {
      console.warn("Autoplay blocked or audio play error:", err);
      musicOn = false;
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
    });
  }

  musicToggle.addEventListener("click", () => {
    if (musicOn) {
      bgAudio.pause();
      musicOn = false;
    } else {
      bgAudio.play().catch(() => {});
      musicOn = true;
    }
    musicToggle.classList.toggle("playing", musicOn);
    musicToggle.setAttribute("aria-pressed", String(musicOn));
  });

  /* ------------------------------------------------------------------
     SCROLL REVEALS
     ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(".reveal, .reveal-scale, .reveal-line");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  /* ------------------------------------------------------------------
     FLOATING PETALS
     ------------------------------------------------------------------ */
  const petalField = document.getElementById("petal-field");
  let petalsStarted = false;

  const petalTypes = [
    "#sym-petal-rose",
    "#sym-petal-gold",
    "#sym-petal-pink",
    "#sym-petal-burgundy"
  ];

  function startPetals() {
    if (petalsStarted || reducedMotion) return;
    petalsStarted = true;

    const count = window.innerWidth < 640 ? 42 : 75;
    for (let i = 0; i < count; i++) {
      spawnPetal(true);
    }
  }

  function spawnPetal(initial) {
    if (!petalField) return;
    const petal = document.createElement("div");
    petal.className = "petal";

    const size = 10 + Math.random() * 20;
    const left = Math.random() * 98;
    const duration = 7 + Math.random() * 11;
    const delay = initial ? Math.random() * -duration : 0;
    const drift = (Math.random() * 200 - 100).toFixed(0) + "px";
    const opacity = 0.5 + Math.random() * 0.45;
    const rotateStart = Math.random() * 360;
    const selectedSymbol = petalTypes[Math.floor(Math.random() * petalTypes.length)];

    petal.style.left = left + "vw";
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.opacity = opacity;
    petal.style.animationDuration = duration + "s";
    petal.style.animationDelay = delay + "s";
    petal.style.setProperty("--drift", drift);
    petal.style.transform = `rotate(${rotateStart}deg)`;
    petal.innerHTML = `<svg viewBox="0 0 30 30"><use href="${selectedSymbol}"/></svg>`;

    petalField.appendChild(petal);
  }

  // Auto-start petals
  startPetals();

  /* ------------------------------------------------------------------
     GALLERY LIGHTBOX
     ------------------------------------------------------------------ */
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightbox-content");
  const lightboxClose = document.getElementById("lightbox-close");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const imgEl = item.querySelector("img");
      if (imgEl && imgEl.src) {
        lightboxContent.innerHTML = `<img src="${imgEl.src}" alt="${imgEl.alt || 'Wedding Photo'}" style="width:auto;max-width:100%;height:auto;max-height:84vh;object-fit:contain;border-radius:4px;box-shadow:0 15px 40px rgba(0,0,0,0.5)">`;
        lightbox.classList.add("open");
      }
    });
  });

  function closeLightbox() { lightbox.classList.remove("open"); }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  /* ------------------------------------------------------------------
     RSVP FORM
     ------------------------------------------------------------------ */
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpThanks = document.getElementById("rsvp-thanks");
  const rsvpPillOptions = document.querySelectorAll(".rsvp-pill-option");

  rsvpPillOptions.forEach((option) => {
    option.addEventListener("click", () => {
      rsvpPillOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }
    rsvpForm.style.display = "none";
    rsvpThanks.classList.add("show");
  });

  /* ------------------------------------------------------------------
     BACK TO TOP SMOOTH SCROLL
     ------------------------------------------------------------------ */
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     COUNTDOWN TIMER LOGIC
     ------------------------------------------------------------------ */
  const weddingDate = new Date("2026-11-15T10:10:00+05:30").getTime();
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");
  const cdMessage = document.getElementById("cd-message");
  const timerGrid = document.getElementById("timer");

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
      if (timerGrid) timerGrid.style.display = "none";
      if (cdMessage) cdMessage.style.display = "block";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, "0");
    if (cdHours) cdHours.textContent = String(hours).padStart(2, "0");
    if (cdMins) cdMins.textContent = String(mins).padStart(2, "0");
    if (cdSecs) cdSecs.textContent = String(secs).padStart(2, "0");
  }

  if (cdDays && cdHours && cdMins && cdSecs) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ------------------------------------------------------------------
     SCRATCH CARD TO REVEAL WEDDING DATE
     ------------------------------------------------------------------ */
  function initScratchCard() {
    const canvas = document.getElementById("scratch-canvas");
    const container = document.querySelector(".scratch-container");
    const autoBtn = document.getElementById("auto-reveal-btn");
    const badge = document.getElementById("scratch-completed");
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let isScratching = false;
    let isRevealed = false;
    let lastPos = null;

    function resizeCanvas() {
      if (isRevealed) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawGoldSurface();
    }

    function drawGoldSurface() {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;
      ctx.globalCompositeOperation = "source-over";

      // Royal Gold Foil Metallic Gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#FDF3A9");
      grad.addColorStop(0.25, "#D4AF37");
      grad.addColorStop(0.5, "#FFF8B5");
      grad.addColorStop(0.75, "#9A7217");
      grad.addColorStop(1, "#B88A32");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Inner ornate border
      ctx.strokeStyle = "rgba(110, 23, 32, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, w - 24, h - 24);

      // Dashed accent border
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, w - 32, h - 32);
      ctx.setLineDash([]);

      // Instruction text rendered onto canvas
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#501017";

      ctx.font = "bold 13px 'Cinzel', serif";
      ctx.fillText("✨ SCRATCH TO REVEAL ✨", w / 2, h / 2 - 12);

      ctx.font = "italic 14px 'Cormorant Garamond', serif";
      ctx.fillText("Rub here to uncover our wedding date", w / 2, h / 2 + 14);
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      let cx, cy;
      if (e.touches && e.touches[0]) {
        cx = e.touches[0].clientX - rect.left;
        cy = e.touches[0].clientY - rect.top;
      } else {
        cx = e.clientX - rect.left;
        cy = e.clientY - rect.top;
      }
      return { x: cx, y: cy };
    }

    function scratch(e) {
      if (!isScratching || isRevealed) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      if (lastPos) {
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.lineWidth = 55;
        ctx.lineCap = "round";
        ctx.stroke();
      } else {
        ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      lastPos = pos;

      checkProgress();
    }

    function startScratch(e) {
      isScratching = true;
      lastPos = getPos(e);
      scratch(e);
    }

    function stopScratch() {
      isScratching = false;
      lastPos = null;
    }

    let checkTimer = null;
    function checkProgress() {
      if (isRevealed || checkTimer) return;
      checkTimer = setTimeout(() => {
        checkTimer = null;
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const pixels = imgData.data;
        let cleared = 0;
        for (let i = 3; i < pixels.length; i += 16) {
          if (pixels[i] === 0) cleared++;
        }
        const percent = (cleared / (pixels.length / 16)) * 100;
        if (percent > 35) {
          revealFull();
        }
      }, 120);
    }

    function revealFull() {
      if (isRevealed) return;
      isRevealed = true;
      canvas.style.transition = "opacity 0.6s ease-out";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.style.display = "none";
        if (badge) badge.classList.add("show");
        if (autoBtn) autoBtn.style.display = "none";
      }, 600);

      if (typeof spawnClickSparkles === "function") {
        spawnClickSparkles({
          clientX: container.getBoundingClientRect().left + container.offsetWidth / 2,
          clientY: container.getBoundingClientRect().top + container.offsetHeight / 2
        });
      }
    }

    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", stopScratch);

    canvas.addEventListener("touchstart", startScratch, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    canvas.addEventListener("touchend", stopScratch);

    if (autoBtn) {
      autoBtn.addEventListener("click", () => {
        revealFull();
      });
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  initScratchCard();

})();
