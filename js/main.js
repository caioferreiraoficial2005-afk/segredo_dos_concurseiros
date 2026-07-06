(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initReveal();
  initCardLottie();
  initHeroVideoLoop();

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

  // Loop do video de fundo do hero com fade suave (sem "corte seco" no loop
  // nativo): fade-out nos ultimos 0.55s antes do fim, fade-in de 500ms ao
  // reiniciar. Roda via requestAnimationFrame para retomar do valor atual
  // de opacidade em vez de saltar, e cancela qualquer frame anterior antes
  // de iniciar uma nova animacao.
  function initHeroVideoLoop() {
    var video = document.querySelector('.hero-video');
    if (!video) return;

    if (reduceMotion) {
      video.loop = true;
      return;
    }

    var FADE_MS = 500;
    var FADE_BEFORE_END_S = 0.55;
    var fadingOut = false;
    var rafId = null;

    function animateOpacity(target, duration) {
      if (rafId) cancelAnimationFrame(rafId);
      var from = parseFloat(video.style.opacity);
      if (isNaN(from)) from = 1;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        video.style.opacity = from + (target - from) * progress;
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = null;
        }
      }
      rafId = requestAnimationFrame(step);
    }

    video.style.opacity = 0;

    function fadeIn() {
      animateOpacity(1, FADE_MS);
    }

    // Se o video ja carregou (cache/rede rapida) antes do listener ser
    // registrado, o evento "loadeddata" nunca dispara e o video fica
    // preso em opacidade 0 -- por isso disparamos o fade-in direto aqui.
    if (video.readyState >= 2) {
      fadeIn();
    } else {
      video.addEventListener('loadeddata', fadeIn, { once: true });
    }

    video.addEventListener('timeupdate', function () {
      if (fadingOut || !video.duration) return;
      if (video.duration - video.currentTime <= FADE_BEFORE_END_S) {
        fadingOut = true;
        animateOpacity(0, FADE_MS);
      }
    });

    video.addEventListener('ended', function () {
      video.style.opacity = 0;
      setTimeout(function () {
        video.currentTime = 0;
        video.play();
        fadingOut = false;
        animateOpacity(1, FADE_MS);
      }, 100);
    });
  }
})();
