/* ==========================================================================
   OSMOVERA — main.js
   Progressive enhancement only: every page works without JavaScript.
   Features: sticky header, mobile nav, scroll reveal, animated counters,
   FAQ accordion, project filtering, contact form validation.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     1. Sticky header shadow
     ---------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------------------
     2. Mobile navigation
     ---------------------------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  function setNav(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") !== "true";
      setNav(open);
    });

    // Close when a link is chosen
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    // Close on Escape, return focus to the toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        navToggle.focus();
      }
    });

    // Close if the viewport grows back to desktop width
    window.matchMedia("(min-width: 921px)").addEventListener("change", function (e) {
      if (e.matches) setNav(false);
    });
  }

  /* ----------------------------------------------------------------------
     3. Scroll reveal (IntersectionObserver)
     ---------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------------------
     4. Animated counters
     Usage: <span class="js-count" data-count="3.8" data-decimals="1"
                   data-suffix="B">0B</span>
     ---------------------------------------------------------------------- */
  var counters = document.querySelectorAll(".js-count");

  function formatNumber(value, decimals) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1600;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic for a smooth landing on the final value
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + formatNumber(target * eased, decimals) + suffix;
      if (progress < 1) window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
        el.textContent =
          (el.getAttribute("data-prefix") || "") +
          formatNumber(parseFloat(el.getAttribute("data-count")) || 0, decimals) +
          (el.getAttribute("data-suffix") || "");
      });
    } else {
      var countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(function (el) {
        countObserver.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------------------
     5. Accordion (FAQ / service details)
     ---------------------------------------------------------------------- */
  var accordionTriggers = document.querySelectorAll(".accordion__trigger");

  accordionTriggers.forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    // Panels start collapsed unless explicitly opened in the markup
    if (trigger.getAttribute("aria-expanded") === "true") {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }

    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close siblings within the same accordion group
      var group = trigger.closest(".accordion");
      if (group && !isOpen) {
        group.querySelectorAll('.accordion__trigger[aria-expanded="true"]').forEach(function (openTrigger) {
          var openPanel = document.getElementById(openTrigger.getAttribute("aria-controls"));
          openTrigger.setAttribute("aria-expanded", "false");
          if (openPanel) openPanel.style.maxHeight = "0px";
        });
      }

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? "0px" : panel.scrollHeight + "px";
    });
  });

  // Keep open accordion panels correctly sized after a resize
  window.addEventListener(
    "resize",
    function () {
      document.querySelectorAll('.accordion__trigger[aria-expanded="true"]').forEach(function (trigger) {
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
      });
    },
    { passive: true }
  );

  /* ----------------------------------------------------------------------
     6. Project filtering
     ---------------------------------------------------------------------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  var projectGrid = document.querySelector("[data-project-grid]");

  if (filterBar && projectGrid) {
    var filterButtons = filterBar.querySelectorAll(".filter-btn");
    var projectCards = projectGrid.querySelectorAll("[data-category]");
    var status = document.querySelector("[data-filter-status]");

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;

      var filter = btn.getAttribute("data-filter");

      filterButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      var shown = 0;
      projectCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });

      if (status) {
        status.textContent =
          "Showing " + shown + " project" + (shown === 1 ? "" : "s") +
          (filter === "all" ? " across all sectors." : ' in "' + btn.textContent.trim() + '".');
      }
    });
  }

  /* ----------------------------------------------------------------------
     7. Contact form validation (client-side demo — no backend required)
     ---------------------------------------------------------------------- */
  var form = document.getElementById("quote-form");

  if (form) {
    var successBox = document.getElementById("form-success");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function fieldWrap(control) {
      return control.closest(".field");
    }

    function setError(control, message) {
      var wrap = fieldWrap(control);
      if (!wrap) return;
      var msg = wrap.querySelector(".error-msg");
      wrap.classList.add("has-error");
      control.setAttribute("aria-invalid", "true");
      if (msg) msg.textContent = message;
    }

    function clearError(control) {
      var wrap = fieldWrap(control);
      if (!wrap) return;
      wrap.classList.remove("has-error");
      control.removeAttribute("aria-invalid");
    }

    function validate(control) {
      var value = (control.value || "").trim();

      if (control.hasAttribute("required") && !value) {
        setError(control, "This field is required.");
        return false;
      }

      if (control.type === "email" && value && !emailPattern.test(value)) {
        setError(control, "Please enter a valid email address, e.g. name@company.com.");
        return false;
      }

      if (control.name === "message" && value && value.length < 20) {
        setError(control, "Please give us at least 20 characters so we can route your enquiry.");
        return false;
      }

      clearError(control);
      return true;
    }

    // Validate individual fields once the user leaves them
    form.querySelectorAll("input, select, textarea").forEach(function (control) {
      control.addEventListener("blur", function () {
        if (control.type === "checkbox" ? !control.required : true) validate(control);
      });
      control.addEventListener("input", function () {
        if (fieldWrap(control) && fieldWrap(control).classList.contains("has-error")) {
          validate(control);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      var firstInvalid = null;

      form.querySelectorAll("input, select, textarea").forEach(function (control) {
        if (control.type === "checkbox") {
          if (control.hasAttribute("required") && !control.checked) {
            setError(control, "Please confirm before submitting.");
            valid = false;
            if (!firstInvalid) firstInvalid = control;
          } else {
            clearError(control);
          }
          return;
        }

        if (!validate(control)) {
          valid = false;
          if (!firstInvalid) firstInvalid = control;
        }
      });

      if (!valid) {
        if (successBox) successBox.classList.remove("is-visible");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Static demo site: no server, so we confirm locally.
      if (successBox) {
        var nameField = form.querySelector("#name");
        successBox.textContent =
          "Thank you" + (nameField && nameField.value ? ", " + nameField.value.trim().split(" ")[0] : "") +
          " — your request has been received. An Osmovera engineer will reply within one business day.";
        successBox.classList.add("is-visible");
        successBox.focus();
      }

      form.reset();
    });
  }

  /* ----------------------------------------------------------------------
     8. Footer year
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
