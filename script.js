(function () {
  "use strict";

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var counts = document.querySelectorAll(".count");
  var cards = document.querySelectorAll(".card");

  function decimalsOf(el) {
    var decimals = Number(el.getAttribute("data-decimals") || "0");
    return Number.isFinite(decimals) ? decimals : 0;
  }

  function targetOf(el) {
    var target = Number(el.getAttribute("data-target"));
    return Number.isFinite(target) ? target : 0;
  }

  function formatValue(value, decimals) {
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return String(Math.round(value));
  }

  function setFinal(el) {
    el.textContent = formatValue(targetOf(el), decimalsOf(el));
  }

  function animateCount(el) {
    var target = targetOf(el);
    var decimals = decimalsOf(el);
    var duration = 1400;
    var started = performance.now();

    function frame(now) {
      if (motionQuery.matches) {
        setFinal(el);
        return;
      }

      var progress = Math.min(1, (now - started) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatValue(target * eased, decimals);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setFinal(el);
      }
    }

    requestAnimationFrame(frame);
  }

  function revealCards() {
    cards.forEach(function (card) {
      card.classList.add("is-in");
    });
  }

  function watchInView(nodes, onEnter, threshold) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(onEnter);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          observer.unobserve(entry.target);
          onEnter(entry.target);
        });
      },
      { threshold: threshold }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function startMotion() {
    counts.forEach(function (el) {
      el.textContent = formatValue(0, decimalsOf(el));
    });

    watchInView(counts, animateCount, 0.55);
    watchInView(cards, function (card) {
      card.classList.add("is-in");
    }, 0.28);
  }

  function showFinalState() {
    counts.forEach(setFinal);
    revealCards();
  }

  if (motionQuery.matches) {
    showFinalState();
  } else {
    startMotion();
  }

  motionQuery.addEventListener("change", function () {
    if (motionQuery.matches) {
      showFinalState();
    }
  });
})();
