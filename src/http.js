/**
 * Отправляет HTTP-запрос с указанными параметрами.
 *
 * @param  {object}  options Параметры запроса.
 * или
 * @param  {string}  url     Адрес запроса.
 * @param  {mixed}   data    Данные запроса.
 * @param  {string}  type    HTTP-метод запроса.
 * @param  {object}  options Параметры запроса.
 * @return {Promise}         Обещание.
 */
$.http = function(url, type, data, options) {

  if (url == null) {
    throw new Error('Arguments are required.');
  }
  
  if (typeof(url) == 'object') {
    options = url;
  }
  else {
    
    if (options == null) options = {};

    options.type = type || 'get';
    options.data = data;
    options.url = url || '';
  }

  return $.promise(function(resolve, reject) {
    options.success = resolve;
    options.error = reject;
    $.ajax(options);
  });
};

/**
 * Отправляет GET HTTP-запрос.
 *
 * @param  {string}  url  Адрес.
 * @param  {object}  data Данные, отправляемые на сервер.
 * @return {Promise}      Обещание. 
 */
$.http.get = function(url, data, options) {
  return $.http(url, 'get', data, options);
};

/**
 * Отправляет POST HTTP-запрос.
 *
 * @param  {string} url  Адрес.
 * @param  {object} data Данные, отправляемые на сервер.
 * @return {Promise}     Обещание.
 */
$.http.post = function(url, data, options) {
  return $.http(url, 'post', data, options);
};

/**
 * Передает GET-запрос на получение JSON.
 *
 * @param  {string}  url  Адрес.
 * @param  {object}  data Данные, передаваемые на сервер.
 * @return {Promise}      Обещание.
 */
$.http.getJSON = function(url, data, options) {
  options = typeof(options) == 'object' ? options : {};
  options.dataType = 'json';
  return $.http.get(url, data, options);
};

/**
 * Передает POST-запрос на получение JSON.
 *
 * @param  {string}  url  Адрес.
 * @param  {object}  data Данные, передаваемые на сервер.
 * @return {Promise}      Обещание.
 */
$.http.postJSON = function(url, data, options) {
  options = typeof(options) == 'object' ? options : {};
  options.dataType = 'json';
  return $.http.post(url, data, options);
};