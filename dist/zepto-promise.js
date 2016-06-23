!(function($, Promise) {

  if ($ == null) {
    throw new Error('Zepto is undefined.');
  }

  if (Promise == null) {
    throw new Error('Promise is undefined.');
  }

  /**
   * Создает новое обещание.
   * 
   * @param  {Promise|function|Error|mixed} src Источник данных для обещания.
   *                                            Если в качестве источника указано обещание, функция вернет его без изменений.
   *                                            Если передана функция, то она будет использована как коллбек вида (resolve, reject).
   *                                            Если передана ошибка, то будет возращено обещание с этой ошибкой.
   *                                            В противном случае, обещание будет разрешено указанным значением.
   * @return {Promise}                          Объект Promise.
   */
  $.promise = function(src) {
    
    if (typeof(src) == 'function') {
      return new Promise(src);
    }
  
    if (src instanceof Error) {
      return new Promise(function(resolve, reject) {
        reject(src);
      });
    }
  
    return new Promise(function(resolve) {
      resolve(src);
    });
  };
  
  /**
   * Ожидает завершения всех переданных обещаний и передает их результат в коллбек.
   * 
   * @param  {Promise}  promise Одно или несколько обещаний или значений, приводимых к ним.
   * @param  {function} cb      Коллбек, обрабатывающий результаты работы обещаний.
   * @return {Promise}          Объект Promise, полученный в результате работы коллбека.
   */
  $.promise.when = function() {
    
    var sources = Array.prototype.slice.call(arguments, 0);
    if (sources.length == 0) {
      throw new Error('Arguments is required.');
    }
  
    var isCb = typeof(sources[sources.length - 1]) == 'function';
    var cb = null;
  
    if (isCb) {
      cb = sources.pop();
    }
  
    var results = [];
    var errors = [];
    var pending = 0;
  
    return $.promise(function(resolve, reject) {
  
      var finish = function() {
  
        if (--pending > 0) return;
  
        if (cb == null) {
          resolve();
          return;
        }
  
        var value = null;
  
        try {
          value = cb(results, errors);
        }
        catch (e) {
          reject(e);
          return;
        }
  
        if (value instanceof Promise) {
          value.then(resolve, reject);
          return;
        }
  
        resolve(value);
      };
  
      if (sources.length == 0) {
        finish();
        return;
      }
  
      var wrap = function(promise, index) {
        
        var success = function() {
          results[index] = Array.prototype.slice.call(arguments, 0);
          finish();
        };
  
        var fail = function() {
          errors[index] = Array.prototype.slice.call(arguments, 0);
          finish();
        };
  
        promise.then(success, fail);
      };
  
      for (var i = 0; i < sources.length; i += 1) {
        promise = $.promise(sources[i]);
        results.push(null);
        errors.push(null);
        pending += 1;
        wrap(promise, i);
      }
    });
  };
  
  /**
   * Возвращает обещание, которое будет разрешено через указанный промежуток времени.
   * 
   * @param  {number} delay Время ожидания в милисекундах.
   * @param  {mixed}  value Значение, с которым будет разрешено обещание.
   * @return {Promise}      Обещание.
   */
  $.promise.wait = function(delay, value) {
  
    return new Promise(function(resolve, reject) {
      
      var callback = function() {
        if (value instanceof Error) reject(value);
        else resolve(value);
      };
  
      setTimeout(callback, delay);
    });
  };
  
  /**
   * Возвращает обещание, которое будет разрешено в следующем цикле выполнения.
   * 
   * @param  {mixed}   value Значение, с которым будет разрешено обещание.
   * @return {Promise}       Обещание.
   */
  $.promise.then = function(value) {
    return new Promise(function(resolve, reject) {
      if (value instanceof Error) reject(value);
      else resolve(value);
    });
  };
  
  /**
   * Псевдоним для then(null, cb).
   *
   * @param  {function} cb Коллбек для обработки ошибки.
   * @return {Promise}     Следующий объект Promise.
   */
  Promise.prototype['catch'] = Promise.prototype['catch'] || function(cb) {
    return this.then(null, cb);
  };
  
  /**
   * Псевдоним для метода catch.
   *
   * @param  {function} cb Коллбек для обработки ошибки.
   * @return {Promise}     Следующий объект Promise.
   */
  Promise.prototype.fail = function(cb) {
    return this['catch'](cb);
  };
  
  
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
})(window.Zepto, window.Promise)