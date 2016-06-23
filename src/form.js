/**
 * Получает объект options для запроса формы.
 *
 * @param  {Zepto}  form    Форма.
 * @param  {object} options Дополнительные параметры запроса.
 * @return {object}         Параметры запроса.
 */
function _getFormOptions(form, options) {

  options = options ? options : {};
  options.type = this.attr('method') || 'get';
  options.url = this.attr('action') || '';
  
  var charset = this.attr('accept-charset');
  if (charset != null) {
    options.headers = options.headers || {};
    options.headers['accept-charset'] = charset;
  }

  return options;
}

/**
 * Асинхронно отправляет форму.
 *
 * @param  {object}  options Дополнительные параметры запроса.
 * @return {Promise}         Обещание.
 */
$.fn.send = function(options) {
  var params = _getFormOptions(this, options);
  params.data = this.serialize();
  return $.http(params);
};

/**
 * Асинхронно отправляет форму, предварительно перекодировав её содержимое в JSON.
 *
 * @param  {object}  options Дополнительные параметры запроса.
 * @return {Promise}         Обещание.
 */
$.fn.sendJSON = function(options) {
  var params = _getFormOptions(this, options);
  params.data = this.serializeObject();
  params.dataType = 'json';
  return $.http(params);
};