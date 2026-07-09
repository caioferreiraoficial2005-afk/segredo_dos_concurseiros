(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initReveal();
  initCardLottie();
  initModulesCarousel();
  initHeroCountdown();

  function initReveal() {
    var revealEls = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { observer.observe(el); });

    var heroEls = document.querySelectorAll('.reveal-hero');
    heroEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  function initCardLottie() {
    var players = document.querySelectorAll('.card-lottie, .split-lottie');
    if (!players.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      players.forEach(function (el) { el.play && el.play(); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var player = entry.target;
          if (player.play) {
            player.play();
          } else {
            player.addEventListener('ready', function () { player.play(); }, { once: true });
          }
          observer.unobserve(player);
        }
      });
    }, { threshold: 0.3 });

    players.forEach(function (el) { observer.observe(el); });
  }

  // Carrossel de modulos: scroll automatico continuo da esquerda para a
  // direita com loop infinito, mais drag manual (mouse/touch via Pointer
  // Events). O track tem as imagens duplicadas (2 copias identicas) e o
  // offset e sempre normalizado para o intervalo (-halfWidth, 0], entao a
  // transicao de uma copia pra outra fica imperceptivel.
  function initModulesCarousel() {
    var carousel = document.getElementById('modulesCarousel');
    var track = document.getElementById('modulesTrack');
    if (!carousel || !track) return;

    var SPEED = -0.6;
    var halfWidth = track.scrollWidth / 2;
    var offset = -halfWidth;
    var dragging = false;
    var dragStartX = 0;
    var dragStartOffset = 0;

    function wrap(value) {
      if (halfWidth <= 0) return value;
      value = value % halfWidth;
      if (value > 0) value -= halfWidth;
      return value;
    }

    function apply() {
      track.style.transform = 'translateX(' + offset + 'px)';
    }

    function frame() {
      if (!dragging) {
        offset = wrap(offset + SPEED);
        apply();
      }
      requestAnimationFrame(frame);
    }

    apply();

    if (!reduceMotion) {
      requestAnimationFrame(frame);
    }

    carousel.addEventListener('pointerdown', function (e) {
      dragging = true;
      carousel.classList.add('dragging');
      dragStartX = e.clientX;
      dragStartOffset = offset;
      carousel.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    carousel.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      offset = wrap(dragStartOffset + (e.clientX - dragStartX));
      apply();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      carousel.classList.remove('dragging');
      try { carousel.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);
  }

  // Cronometro regressivo ate a data em data-deadline. Atualiza a cada
  // segundo; quando o prazo passa, trava em 00:00:00:00 em vez de mostrar
  // valores negativos.
  function initHeroCountdown() {
    var root = document.getElementById('heroCountdown');
    if (!root) return;

    var deadline = new Date(root.dataset.deadline).getTime();
    var daysEl = root.querySelector('[data-unit="days"]');
    var hoursEl = root.querySelector('[data-unit="hours"]');
    var minutesEl = root.querySelector('[data-unit="minutes"]');
    var secondsEl = root.querySelector('[data-unit="seconds"]');

    function pad(n) {
      return n < 10 ? '0' + n : String(n);
    }

    function tick() {
      var diff = Math.max(0, deadline - Date.now());
      var totalSeconds = Math.floor(diff / 1000);
      daysEl.textContent = pad(Math.floor(totalSeconds / 86400));
      hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
      minutesEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      secondsEl.textContent = pad(totalSeconds % 60);
    }

    tick();
    setInterval(tick, 1000);
  }
})();
