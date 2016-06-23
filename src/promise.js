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

