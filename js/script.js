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

  function startPetals() {
    if (petalsStarted || reducedMotion) return;
    petalsStarted = true;

    const count = window.innerWidth < 640 ? 18 : 28;
    for (let i = 0; i < count; i++) {
      spawnPetal(true);
    }
  }

  function spawnPetal(initial) {
    if (!petalField) return;
    const petal = document.createElement("div");
    petal.className = "petal";

    const size = 12 + Math.random() * 16;
    const left = Math.random() * 96;
    const duration = 9 + Math.random() * 10;
    const delay = initial ? Math.random() * -duration : 0;
    const drift = (Math.random() * 140 - 70).toFixed(0) + "px";
    const opacity = 0.45 + Math.random() * 0.45;
    const rotateStart = Math.random() * 360;
    const petalType = Math.random() > 0.45 ? "#sym-petal-rose" : "#sym-petal-gold";

    petal.style.left = left + "vw";
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.opacity = opacity;
    petal.style.animationDuration = duration + "s";
    petal.style.animationDelay = delay + "s";
    petal.style.setProperty("--drift", drift);
    petal.style.transform = `rotate(${rotateStart}deg)`;
    petal.innerHTML = `<svg viewBox="0 0 30 30"><use href="${petalType}"/></svg>`;

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

})();
