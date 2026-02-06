document.addEventListener("DOMContentLoaded", function () {
  var yearNode = document.getElementById("y");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  var loader = document.getElementById("page-loader");
  var links = document.querySelectorAll("a.lang[href]");
  links.forEach(function (link) {
    if (link.classList.contains("current")) return;
    link.addEventListener("click", function () {
      if (!loader) return;
      loader.classList.add("is-visible");
      document.body.classList.add("is-loading");
    });
  });

  var headline = document.querySelector(".headline");
  var stackShowcase = document.querySelector(".stack-showcase");
  var stackStage = stackShowcase
    ? stackShowcase.querySelector(".stack-stage")
    : null;
  var stackNotes = stackStage
    ? Array.prototype.slice.call(stackStage.querySelectorAll(".stack-note"))
    : [];
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function stackStageIsMobile() {
    if (!stackStage) return true;
    if (window.matchMedia("(max-width: 640px)").matches) return true;
    var display = window.getComputedStyle(stackStage).display;
    return display === "grid";
  }

  function scatterStackNotesWithinStage() {
    if (!stackNotes.length || prefersReducedMotion.matches) return;
    if (stackStageIsMobile()) return;
    var stageRect = stackStage.getBoundingClientRect();
    if (stageRect.width <= 1 || stageRect.height <= 1) return;

    stackNotes.forEach(function (note) {
      var noteWidth = note.offsetWidth || 0;
      var noteHeight = note.offsetHeight || 0;
      var maxLeft = Math.max(0, stageRect.width - noteWidth);
      var maxTop = Math.max(0, stageRect.height - noteHeight);
      var left = Math.random() * maxLeft;
      var top = Math.random() * maxTop;
      var leftPct = (left / stageRect.width) * 100;
      var topPct = (top / stageRect.height) * 100;

      note.style.setProperty("--active-left", leftPct.toFixed(2) + "%");
      note.style.setProperty("--active-top", topPct.toFixed(2) + "%");
    });
  }

  if (stackShowcase) {
    if ("IntersectionObserver" in window) {
      var stackObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            stackShowcase.classList.add("is-inview");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      stackObserver.observe(stackShowcase);
    } else {
      stackShowcase.classList.add("is-inview");
    }

    var lastScatter = 0;
    window.addEventListener(
      "wheel",
      function () {
        if (prefersReducedMotion.matches) return;
        if (stackStageIsMobile()) return;
        var now = Date.now();
        if (now - lastScatter < 220) return;
        lastScatter = now;
        window.requestAnimationFrame(scatterStackNotesWithinStage);
      },
      { passive: true }
    );
  }
  if (!headline) return;

  var ticking = false;
  function updateHeadlineParallax() {
    var y = window.scrollY || window.pageYOffset || 0;
    var maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    var progress = Math.min(1, Math.max(0, y / maxScroll));
    // Friction-like dead-zone: very slow movement at first, then gradually catches up.
    var deadZone = 0.22;
    var carry = 0.08;
    var eased;
    if (progress < deadZone) {
      var t0 = progress / deadZone;
      eased = carry * Math.pow(t0, 2.4);
    } else {
      var t1 = (progress - deadZone) / (1 - deadZone);
      eased = carry + (1 - carry) * Math.pow(t1, 1.08);
    }
    var top = parseFloat(window.getComputedStyle(headline).top) || 12;
    var maxShift = Math.max(0, window.innerHeight - headline.offsetHeight - top - 12);
    var shift = eased * maxShift;
    headline.style.setProperty("--headline-shift", shift.toFixed(2) + "px");
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeadlineParallax);
    },
    { passive: true }
  );
  window.addEventListener("resize", updateHeadlineParallax);
  updateHeadlineParallax();
});
