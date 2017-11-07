var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (body.classList.contains('typeform-mobile-modal-open')) {
      body.classList.remove('typeform-mobile-modal-open');
    }
  });
});
var body = document.getElementsByTagName('body')[0];
var config = { attributes: true, childList: false, characterData: false };
observer.observe(body, config);
