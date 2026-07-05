(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initReveal();
  initCardLottie();

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
    var players = document.querySelectorAll('.card-lottie');
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
})();
