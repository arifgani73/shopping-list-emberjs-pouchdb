(function () {
  'use strict';

  self.addEventListener('install', function installEventListenerCallback(event) {
    return self.skipWaiting();
  });

  self.addEventListener('activate', function installEventListenerCallback(event) {
    return self.clients.claim();
  });

  var FILES = [];
  var PREPEND = undefined;
  var VERSION$1 = '1';
  var REQUEST_MODE = 'cors';
  var LENIENT_ERRORS = false;

  /*
   * Deletes all caches that start with the `prefix`, except for the
   * cache defined by `currentCache`
   */
  function cleanupCaches (prefix, currentCache) {
    return caches.keys().then(function (cacheNames) {
      cacheNames.forEach(function (cacheName) {
        var isOwnCache = cacheName.indexOf(prefix) === 0;
        var isNotCurrentCache = cacheName !== currentCache;

        if (isOwnCache && isNotCurrentCache) {
          caches["delete"](cacheName);
        }
      });
    });
  }

  var CACHE_KEY_PREFIX = 'esw-asset-cache';
  var CACHE_NAME = CACHE_KEY_PREFIX + '-' + VERSION$1;
  var CACHE_URLS = FILES.map(function (file) {
    return new URL(file, PREPEND || self.location).toString();
  });

  /*
   * Removes all cached requests from the cache that aren't in the `CACHE_URLS`
   * list.
   */
  var PRUNE_CURRENT_CACHE = function PRUNE_CURRENT_CACHE() {
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.keys().then(function (keys) {
        keys.forEach(function (request) {
          if (CACHE_URLS.indexOf(request.url) === -1) {
            cache['delete'](request);
          }
        });
      });
    });
  };

  self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(CACHE_URLS.map(function (url) {
        var request = new Request(url, { mode: REQUEST_MODE });
        return fetch(request).then(function (response) {
          if (response.status >= 400) {
            var error = new Error('Request for ' + url + ' failed with status ' + response.statusText);

            if (LENIENT_ERRORS) {
              console.warning('Not caching ' + url + ' due to ' + error);
              return;
            } else {
              throw error;
            }
          }

          return cache.put(url, response);
        })['catch'](function (error) {
          console.error('Not caching ' + url + ' due to ' + error);
        });
      }));
    }));
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(Promise.all([cleanupCaches(CACHE_KEY_PREFIX, CACHE_NAME), PRUNE_CURRENT_CACHE()]));
  });

  self.addEventListener('fetch', function (event) {
    var isGETRequest = event.request.method === 'GET';
    var shouldRespond = CACHE_URLS.indexOf(event.request.url) !== -1;

    if (isGETRequest && shouldRespond) {
      event.respondWith(caches.match(event.request, { cacheName: CACHE_NAME }).then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }));
    }
  });

  var VERSION$2 = '1';
  var PATTERNS = ['/'];

  /**
   * Create an absolute URL, allowing regex expressions to pass
   *
   * @param {string} url
   * @param {string|object} baseUrl
   * @public
   */

  function createNormalizedUrl(url) {
    var baseUrl = arguments.length <= 1 || arguments[1] === undefined ? self.location : arguments[1];

    return decodeURI(new URL(encodeURI(url), baseUrl).toString());
  }

  /**
   * Create an (absolute) URL Regex from a given string
   *
   * @param {string} url
   * @returns {RegExp}
   * @public
   */

  function createUrlRegEx(url) {
    var normalized = createNormalizedUrl(url);
    return new RegExp("^" + normalized + "$");
  }

  /**
   * Check if given URL matches any pattern
   *
   * @param {string} url
   * @param {array} patterns
   * @returns {boolean}
   * @public
   */

  function urlMatchesAnyPattern(url, patterns) {
    return !!patterns.find(function (pattern) {
      return pattern.test(decodeURI(url));
    });
  }

  var CACHE_KEY_PREFIX$1 = 'esw-cache-fallback';
  var CACHE_NAME$1 = CACHE_KEY_PREFIX$1 + '-' + VERSION$2;

  var PATTERN_REGEX = PATTERNS.map(createUrlRegEx);

  self.addEventListener('fetch', function (event) {
    var request = event.request;
    if (request.method !== 'GET' || !/^https?/.test(request.url)) {
      return;
    }

    if (urlMatchesAnyPattern(request.url, PATTERN_REGEX)) {
      event.respondWith(caches.open(CACHE_NAME$1).then(function (cache) {
        return fetch(request).then(function (response) {
          cache.put(request, response.clone());
          return response;
        })['catch'](function () {
          return caches.match(event.request);
        });
      }));
    }
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(cleanupCaches(CACHE_KEY_PREFIX$1, CACHE_NAME$1));
  });

  var VERSION$3 = '1';
  var INDEX_HTML_PATH = 'index.html';
  var INDEX_EXCLUDE_SCOPE = [];
  var INDEX_INCLUDE_SCOPE = [];

  var CACHE_KEY_PREFIX$2 = 'esw-index';
  var CACHE_NAME$2 = CACHE_KEY_PREFIX$2 + '-' + VERSION$3;

  var INDEX_HTML_URL = new URL(INDEX_HTML_PATH, self.location).toString();

  self.addEventListener('install', function (event) {
    event.waitUntil(fetch(INDEX_HTML_URL, { credentials: 'include' }).then(function (response) {
      return caches.open(CACHE_NAME$2).then(function (cache) {
        return cache.put(INDEX_HTML_URL, response);
      });
    }));
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(cleanupCaches(CACHE_KEY_PREFIX$2, CACHE_NAME$2));
  });

  self.addEventListener('fetch', function (event) {
    var request = event.request;
    var isGETRequest = request.method === 'GET';
    var isHTMLRequest = request.headers.get('accept').indexOf('text/html') !== -1;
    var isLocal = new URL(request.url).origin === location.origin;
    var scopeExcluded = urlMatchesAnyPattern(request.url, INDEX_EXCLUDE_SCOPE);
    var scopeIncluded = !INDEX_INCLUDE_SCOPE.length || urlMatchesAnyPattern(request.url, INDEX_INCLUDE_SCOPE);

    if (isGETRequest && isHTMLRequest && isLocal && scopeIncluded && !scopeExcluded) {
      event.respondWith(caches.match(INDEX_HTML_URL, { cacheName: CACHE_NAME$2 }));
    }
  });

}());