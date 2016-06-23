!(function($, Promise) {

  if ($ == null) {
    throw new Error('Zepto is undefined.');
  }

  if (Promise == null) {
    throw new Error('Promise is undefined.');
  }

  //=include promise.js
  //=include http.js
  //=include form.js
})(window.Zepto, window.Promise)