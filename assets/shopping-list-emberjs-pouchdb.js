"use strict";



define('shopping-list-emberjs-pouchdb/adapters/application', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Adapter.extend({
    pouchService: Ember.inject.service('pouch-service'),
    db: Ember.computed(function () {
      return this.get('pouchService.db');
    }),

    shouldReloadAll: function shouldReloadAll() {
      return true;
    },
    shouldReloadRecord: function shouldReloadRecord() {
      return true;
    },
    createRecord: function createRecord(store, type, snapshot) {
      var doc = this.serialize(snapshot, { includeId: true });
      return this.get('db').put(doc).then(function (response) {
        doc._id = response.id;
        return doc;
      });
    },
    findRecord: function findRecord(store, type, id) {
      return this.get('db').get(id);
    },
    findAll: function findAll(store, type, sinceToken, snapshot) {
      var selector = { type: type.modelName };
      if (snapshot.adapterOptions && snapshot.adapterOptions.list_id) {
        selector.list = snapshot.adapterOptions.list_id;
      }
      return this.get('db').find({ selector: selector }).then(function (docs) {
        var d = docs.docs;
        d.sort(function (doca, docb) {
          var a = null;
          var b = null;
          if (type.modelName === 'list') {
            // sort list by date
            b = doca.updatedAt || doca.createdAt;
            a = docb.updatedAt || docb.createdAt;
          } else {
            // sort items by name
            a = doca.title.toLowerCase();
            b = docb.title.toLowerCase();
          }
          if (a < b) return -1;else if (a > b) return 1;else return 0;
        });
        return d;
      });
    },
    updateRecord: function updateRecord(store, type, snapshot) {
      var data = this.serialize(snapshot, { includeId: true });
      var db = this.get('db');
      return db.get(data._id).then(function (doc) {
        data._rev = doc._rev;
        data.updatedAt = new Date().toISOString();
        return data;
      }).then(function (d) {
        return db.put(d).then(function () {
          return null;
        });
      });
    },
    deleteRecord: function deleteRecord(store, type, snapshot) {
      var _this = this;

      var db = this.get('db');
      return db.get(snapshot.id).then(function (doc) {
        if (doc.type === 'list') {
          // find all items beloging to list
          return db.find({
            selector: {
              type: 'item',
              list: snapshot.id
            }
          }).then(function (docs) {
            var items = docs ? docs.docs || docs : docs;
            if (items && items.length) {
              // remove all items belonging to list
              return db.bulkDocs(items.map(function (item) {
                item._deleted = true;
              })).then(function () {
                // remove list
                return _this._delete(db, doc._id, doc._rev);
              });
            } else {
              // remove list
              return _this._delete(db, doc._id, doc._rev);
            }
          });
        } else {
          // remove item
          return _this._delete(db, doc._id, doc._rev);
        }
      });
    },
    _delete: function _delete(db, id, rev) {
      return db.remove(id, rev).then(function () {
        return null;
      });
    }
  });
});
define('shopping-list-emberjs-pouchdb/app', ['exports', 'shopping-list-emberjs-pouchdb/resolver', 'ember-load-initializers', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('shopping-list-emberjs-pouchdb/components/shopping-list-add-modal', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    isItemsList: false,
    listId: null,
    newRecord: Ember.computed('isItemsList', 'listId', function () {
      var record = { type: this.get('isItemsList') ? 'item' : 'list' };
      if (this.get('listId')) {
        record.list = this.get('listId');
      }
      return record;
    })
  });
});
define('shopping-list-emberjs-pouchdb/components/shopping-list-item', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    editMode: false,
    item: {},
    actions: {
      toggleEdit: function toggleEdit() {
        this.toggleProperty('editMode');
      },
      toggleChecked: function toggleChecked() {
        this.set('item.checked', !this.get('item.checked'));
        this.send('updateItem');
      },
      updateItem: function updateItem() {
        var defer = Ember.RSVP.defer();
        var self = this;
        defer.promise.then(function () {
          self.set('editMode', false);
        }, console.error);
        this.sendAction('onUpdateItem', this.get('item'), defer);
      },
      removeItem: function removeItem() {
        this.sendAction('onRemoveItem', this.get('item._id'));
      }
    }
  });
});
define('shopping-list-emberjs-pouchdb/components/shopping-list-list', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    editMode: false,
    list: {},

    totalItems: Ember.computed('list.totalItems', function () {
      return this.get('list.totalItems');
    }),

    checkedItems: Ember.computed('list.checkedItems', function () {
      return this.get('list.checkedItems');
    }),

    actions: {
      toggleEdit: function toggleEdit() {
        this.toggleProperty('editMode');
      },
      updateList: function updateList() {
        var defer = Ember.RSVP.defer();
        var self = this;
        defer.promise.then(function () {
          self.set('editMode', false);
        }, console.error);
        this.sendAction('onUpdateList', this.get('list'), defer);
      },
      removeList: function removeList() {
        this.sendAction('onRemoveList', this.get('list._id'));
      },
      listClicked: function listClicked() {
        Ember.$('#header-title').text(this.get('list.title'));
      }
    }
  });
});
define('shopping-list-emberjs-pouchdb/components/shopping-list-settings-modal', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    pouchService: Ember.inject.service(),

    settings: Ember.computed('pouchService.settings', function () {
      return this.get('pouchService.settings');
    })
  });
});
define('shopping-list-emberjs-pouchdb/controllers/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    router: Ember.inject.service(),
    pouchService: Ember.inject.service(),

    isItemsList: Ember.computed.equal('router.currentRouteName', 'shopping-list-items'),

    listId: Ember.computed('router.currentURL', function () {
      var url = this.get('router.currentURL');
      return url && url.indexOf('/list/') === 0 ? url.replace('/list/', '') : null;
    }),

    init: function init() {
      var _this = this;

      this.get('pouchService').sync(null, function () {
        _this.send('refreshRoute');
      });
    },


    actions: {
      goBack: function goBack() {
        Ember.$('#header-title').text('Shopping Lists');
      },
      refreshRoute: function refreshRoute() {
        var route = Ember.getOwner(this).lookup('route:' + this.get('router.currentRouteName'));
        return route.refresh();
      },
      sync: function sync(settings) {
        var _this2 = this;

        this.get('pouchService').sync(settings ? settings.remoteDB : '', function () {
          _this2.send('refreshRoute');
        }).then(function () {
          if (_this2.get('isItemsList')) {
            _this2.store.unloadAll('item');
            _this2.store.findAll('item');
          } else {
            _this2.store.unloadAll('list');
            _this2.store.findAll('list');
          }
          _this2.send('closeSettingsModal');
        });
      },
      openSettingsModal: function openSettingsModal() {
        Ember.$('body').addClass('shopping-list-settings-modal');
      },
      closeSettingsModal: function closeSettingsModal() {
        Ember.$('body').removeClass('shopping-list-settings-modal');
      },
      openAddModal: function openAddModal() {
        document.getElementById('shopping-list-add-form').reset();
        Ember.$('body').addClass('shopping-list-add-modal');
      },
      closeAddModal: function closeAddModal(newRecord) {
        if (newRecord) {
          if (newRecord.type === 'item') {
            this.send('addItem', newRecord);
          } else {
            this.send('addList', newRecord);
          }
        }

        Ember.$('body').removeClass('shopping-list-add-modal');
      }
    }
  });
});
define('shopping-list-emberjs-pouchdb/helpers/app-version', ['exports', 'shopping-list-emberjs-pouchdb/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('shopping-list-emberjs-pouchdb/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('shopping-list-emberjs-pouchdb/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('shopping-list-emberjs-pouchdb/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _config$APP = _environment.default.APP,
      name = _config$APP.name,
      version = _config$APP.version;
  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('shopping-list-emberjs-pouchdb/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('shopping-list-emberjs-pouchdb/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('shopping-list-emberjs-pouchdb/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('shopping-list-emberjs-pouchdb/initializers/export-application-global', ['exports', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('shopping-list-emberjs-pouchdb/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('shopping-list-emberjs-pouchdb/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('shopping-list-emberjs-pouchdb/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("shopping-list-emberjs-pouchdb/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('shopping-list-emberjs-pouchdb/models/item', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    _id: _emberData.default.attr('string', {
      defaultValue: function defaultValue() {
        return 'item:' + cuid();
      }
    }),
    type: _emberData.default.attr('string', {
      defaultValue: function defaultValue() {
        return 'item';
      }
    }),
    version: _emberData.default.attr('number', {
      defaultValue: function defaultValue() {
        return 1;
      }
    }),
    list: _emberData.default.attr('string'),
    title: _emberData.default.attr('string'),
    checked: _emberData.default.attr('boolean', {
      defaultValue: function defaultValue() {
        return false;
      }
    }),
    createdAt: _emberData.default.attr('string', {
      defaultValue: function defaultValue() {
        return new Date().toISOString();
      }
    }),
    updatedAt: _emberData.default.attr('string'),

    _sanitizedid: Ember.computed('_id', function () {
      return this.get('_id').replace(/(:)/gi, '-');
    })
  });
});
define('shopping-list-emberjs-pouchdb/models/list', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    _id: _emberData.default.attr('string', {
      defaultValue: function defaultValue() {
        return 'list:' + cuid();
      }
    }),
    type: _emberData.default.attr('string', {
      defaultValue: function defaultValue() {
        return 'list';
      }
    }),
    version: _emberData.default.attr('number', {
      defaultValue: function defaultValue() {
        return 1;
      }
    }),
    title: _emberData.default.attr('string'),
    checked: _emberData.default.attr('boolean', {
      defaultValue: function defaultValue() {
        return false;
      }
    }),
    createdAt: _emberData.default.attr('string', {
      defaultValue: function defaultValue() {
        return new Date().toISOString();
      }
    }),
    updatedAt: _emberData.default.attr('string'),

    _sanitizedid: Ember.computed('_id', function () {
      return this.get('_id').replace(/(:)/gi, '-');
    }),

    items: Ember.computed(function () {
      var _this = this;

      var promise = this.get('store').findAll('item').then(function (items) {
        return items.filter(function (item) {
          return item.get('list') === _this.get('_id');
        });
      });
      return _emberData.default.PromiseObject.create({ promise: promise });
    }).volatile(),

    totalItems: Ember.computed('items', function () {
      var _this2 = this;

      var store = this.get('store');
      if (store) {
        var promise = store.findAll('item').then(function (items) {
          if (items && items.length) {
            return items.filter(function (item) {
              return item.get('list') === _this2.get('_id');
            }).length;
          } else {
            return 0;
          }
        });
        return _emberData.default.PromiseObject.create({ promise: promise });
      } else {
        return 0;
      }
    }).volatile(),

    checkedItems: Ember.computed('items', function () {
      var _this3 = this;

      var store = this.get('store');
      if (store) {
        var promise = store.findAll('item').then(function (items) {
          if (items && items.length) {
            return items.filter(function (item) {
              return item.get('list') === _this3.get('_id') && item.get('checked');
            }).length;
          } else {
            return 0;
          }
        });
        return _emberData.default.PromiseObject.create({ promise: promise });
      } else {
        return 0;
      }
    }).volatile()
  });
});
define('shopping-list-emberjs-pouchdb/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('shopping-list-emberjs-pouchdb/router', ['exports', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {
    this.route('shopping-list-emberjs-pouchdb');
    this.route('shopping-list-items', { path: '/list/:list_id' });
  });

  exports.default = Router;
});
define('shopping-list-emberjs-pouchdb/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    beforeModel: function beforeModel() {
      this.replaceWith('shopping-list-emberjs-pouchdb');
    }
  });
});
define('shopping-list-emberjs-pouchdb/routes/shopping-list-emberjs-pouchdb', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    model: function model() {
      return this.store.findAll('list').then(function (docs) {
        return docs;
      });
    },


    actions: {
      addList: function addList(list) {
        var _this = this;

        this.store.createRecord('list', list).save().then(function () {
          _this.refresh();
        }).catch(console.error);
      },
      removeList: function removeList(listid) {
        var _this2 = this;

        this.store.findRecord('list', listid).then(function (list) {
          list.get('items').then(function (items) {
            items.forEach(function (item) {
              Ember.run.once(_this2, function () {
                item.deleteRecord();
                item.save();
              });
            }, _this2);

            list.deleteRecord();
            list.save().then(function () {
              _this2.refresh();
            });
          });
        }).catch(console.error);
      },
      updateList: function updateList(list, defer) {
        this.store.findRecord('list', list.get('_id')).then(function (doc) {
          doc.set('title', list.get('title'));
          doc.save().then(function () {
            defer.resolve();
          });
        }).catch(defer.reject);
      }
    }
  });
});
define('shopping-list-emberjs-pouchdb/routes/shopping-list-items', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    listId: null,

    model: function model(params) {
      var _this = this;

      return this.store.findRecord('list', params.list_id).then(function (list) {
        _this.set('listId', params.list_id);
        return list.get('items');
      });
    },
    activate: function activate() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },


    actions: {
      addItem: function addItem(item) {
        var _this2 = this;

        this.store.createRecord('item', item).save().then(function () {
          _this2.refresh();
        }).catch(console.error);
      },
      removeItem: function removeItem(itemid) {
        var _this3 = this;

        this.store.findRecord('item', itemid).then(function (item) {
          item.deleteRecord();
          item.save().then(function () {
            _this3.refresh();
          });
        }).catch(console.error);
      },
      updateItem: function updateItem(item, defer) {
        this.store.findRecord('item', item.get('_id')).then(function (doc) {
          doc.set('title', item.get('title'));
          doc.set('checked', item.get('checked'));
          doc.save().then(function () {
            return defer.resolve();
          });
        }).catch(defer.reject);
      }
    }
  });
});
define('shopping-list-emberjs-pouchdb/serializers/application', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.JSONSerializer.extend({
    primaryKey: '_id'
  });
});
define('shopping-list-emberjs-pouchdb/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define('shopping-list-emberjs-pouchdb/services/pouch-service', ['exports', 'npm:pouchdb-browser', 'npm:pouchdb-find', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _npmPouchdbBrowser, _npmPouchdbFind, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  _npmPouchdbBrowser.default.plugin(_npmPouchdbFind.default);

  exports.default = Ember.Service.extend({
    store: Ember.inject.service(),

    init: function init() {
      var _this = this;

      var dbname = _environment.default.pouchDBName || 'shopping';
      var db = new _npmPouchdbBrowser.default(dbname);
      this.set('db', db);

      db.info().then(function (info) {
        console.log('db.info', info);
        return db.createIndex({
          index: { fields: ['type'] }
        });
      }).catch(console.error);

      db.get('_local/user').then(function (doc) {
        _this.set('settings', doc);
        console.log('db.settings', _this.get('settings'));
      }).catch(function (err) {
        if (err) {
          console.error(err);
        }
        var settings = _this.get('settings');
        settings['_id'] = '_local/user';
        db.put(settings);
      });
    },


    db: null,

    settings: {},

    _dbsync: null,

    syncStatus: null,

    syncStatusUpdate: Ember.observer('syncStatus', function () {
      var status = this.get('syncStatus');
      if (status === 'syncing') {
        Ember.$('body').addClass('shopping-list-sync');
        Ember.$('body').removeClass('shopping-list-error-sync');
      } else if (status === 'error') {
        Ember.$('body').removeClass('shopping-list-sync');
        Ember.$('body').addClass('shopping-list-error-sync');
      } else {
        Ember.$('body').removeClass('shopping-list-sync');
        Ember.$('body').removeClass('shopping-list-error-sync');
      }
    }),

    resetStore: function resetStore() {
      this.get('store').unloadAll('list');
      this.get('store').unloadAll('item');
      this.get('store').findAll('list');
      this.get('store').findAll('item');
    },
    handleChanges: function handleChanges(err, updates, onchange) {
      if (err) {
        console.error(err);
      } else {
        var store = this.get('store');

        updates.forEach(function (update) {
          if (update._deleted) {
            var record = store.peekRecord(update.type, update._id);
            if (record) {
              store.unloadRecord(record);
            }
          }
          if (update.type === 'item') {
            var _record = store.peekRecord('list', update.list);
            if (_record) {
              store.unloadRecord(_record);
            }
          }
        });
      }

      if (typeof onchange === 'function') {
        onchange(err, updates);
      }
    },
    sync: function sync(remoteDB, onchange) {
      var _this2 = this;

      var id = '_local/user';
      var db = this.get('db');
      this.set('syncStatus', 'syncing');
      return db.get(id).then(function (doc) {
        if (typeof remoteDB === 'string') {
          doc.remoteDB = remoteDB;
          _this2.set('settings', doc);
          return db.put(doc);
        } else {
          remoteDB = _this2.get('settings.remoteDB');
        }
        return doc;
      }).then(function () {
        if (_this2.get('_dbsync')) {
          _this2.get('_dbsync').cancel();
        }
        if (remoteDB) {
          return new Promise(function (resolve, reject) {
            // do one-off sync from the server until completion
            db.sync(remoteDB).on('complete', function (info) {
              // then two-way, continuous, retriable sync
              var dbsync = db.sync(remoteDB, { live: true, retry: true }).on('change', function (info) {
                // incoming changes only
                if (info.direction === 'pull' && info.change && info.change.docs) {
                  _this2.handleChanges(null, info.change.docs, onchange);
                }
              }).on('error', function (err) {
                console.warn(err);
                _this2.handleChanges(err, null, onchange);
              });

              _this2.set('_dbsync', dbsync);
              _this2.set('syncStatus', '');
              return resolve(info);
            }).on('error', function (err) {
              _this2.set('syncStatus', 'error');
              return reject(err);
            });
          });
        } else {
          _this2.set('syncStatus', '');
        }
      }).catch(function (err) {
        if (err) {
          console.error(err);
        }
        _this2.set('syncStatus', 'error');
      });
    }
  });
});
define("shopping-list-emberjs-pouchdb/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "faZDr2KT", "block": "{\"symbols\":[],\"statements\":[[6,\"header\"],[9,\"class\",\"navbar-fixed\"],[7],[0,\"\\n  \"],[6,\"nav\"],[9,\"id\",\"nav\"],[9,\"class\",\"primary-color\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"nav-wrapper\"],[7],[0,\"\\n      \"],[6,\"span\"],[9,\"class\",\"brand-logo left\"],[7],[0,\"\\n\"],[4,\"if\",[[19,0,[\"isItemsList\"]]],null,{\"statements\":[[4,\"link-to\",[\"index\"],null,{\"statements\":[[0,\"          \"],[6,\"i\"],[9,\"class\",\"material-icons\"],[3,\"action\",[[19,0,[]],\"goBack\"]],[7],[0,\"arrow_back\"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"        \"],[6,\"span\"],[9,\"id\",\"header-title\"],[7],[0,\"Shopping Lists\"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[2,\" settings button \"],[0,\"\\n      \"],[6,\"a\"],[9,\"href\",\"#\"],[9,\"class\",\"right settings\"],[3,\"action\",[[19,0,[]],\"openSettingsModal\"]],[7],[6,\"i\"],[9,\"class\",\"material-icons\"],[7],[0,\"settings\"],[8],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"main\"],[7],[0,\"\\n  \"],[1,[18,\"outlet\"],false],[0,\"\\n  \"],[6,\"button\"],[9,\"id\",\"add-button\"],[9,\"class\",\"btn-floating btn-large secondary-color right\"],[3,\"action\",[[19,0,[]],\"openAddModal\"]],[7],[0,\"\\n    \"],[6,\"i\"],[9,\"class\",\"material-icons\"],[7],[0,\"add\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[1,[25,\"shopping-list-settings-modal\",null,[[\"closeModal\",\"sync\"],[[25,\"action\",[[19,0,[]],\"closeSettingsModal\"],null],[25,\"action\",[[19,0,[]],\"sync\"],null]]]],false],[0,\"\\n\"],[1,[25,\"shopping-list-add-modal\",null,[[\"isItemsList\",\"listId\",\"closeModal\"],[[19,0,[\"isItemsList\"]],[19,0,[\"listId\"]],[25,\"action\",[[19,0,[]],\"closeAddModal\"],null]]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/application.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/components/shopping-list-add-modal", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "vgu2X6pe", "block": "{\"symbols\":[\"&default\",\"@closeModal\"],\"statements\":[[11,1],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"modal bottom-sheet\"],[7],[0,\"\\n  \"],[6,\"form\"],[9,\"id\",\"shopping-list-add-form\"],[9,\"class\",\"col s12 white\"],[3,\"action\",[[19,0,[]],[25,\"action\",[[19,0,[]],[19,2,[]],[19,0,[\"newRecord\"]]],null]],[[\"on\"],[\"submit\"]]],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"modal-content\"],[7],[0,\"\\n\"],[4,\"if\",[[19,0,[\"isItemsList\"]]],null,{\"statements\":[[0,\"      \"],[6,\"h5\"],[7],[0,\"Add an Item\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"input-field col s12\"],[7],[0,\"\\n          \"],[1,[25,\"input\",null,[[\"value\",\"class\",\"placeholder\",\"autofocus\",\"required\"],[[19,0,[\"newRecord\",\"title\"]],\"validate\",\"Enter an item to add to the shopping list\",true,true]]],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[1,[25,\"input\",null,[[\"name\",\"type\",\"value\",\"required\"],[\"type\",\"hidden\",[19,0,[\"newRecord\",\"type\"]],true]]],false],[0,\"\\n        \"],[1,[25,\"input\",null,[[\"name\",\"type\",\"value\",\"required\"],[\"list\",\"hidden\",[19,0,[\"newRecord\",\"list\"]],true]]],false],[0,\"\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[6,\"h5\"],[7],[0,\"Create a Shopping List\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"input-field col s12\"],[7],[0,\"\\n          \"],[1,[25,\"input\",null,[[\"value\",\"class\",\"placeholder\",\"autofocus\",\"required\"],[[19,0,[\"newRecord\",\"title\"]],\"validate\",\"Enter a title for the shopping list\",true,true]]],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[1,[25,\"input\",null,[[\"name\",\"type\",\"value\",\"required\"],[\"type\",\"hidden\",[19,0,[\"newRecord\",\"list\"]],true]]],false],[0,\"\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"modal-footer primary-color\"],[7],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"button\"],[9,\"data-escape\",\"closeadd\"],[3,\"action\",[[19,0,[]],[25,\"action\",[[19,0,[]],[19,2,[]]],null]]],[7],[0,\"Cancel\"],[8],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"submit\"],[9,\"data-escape\",\"closeadd\"],[7],[0,\"Add\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"modal-overlay\"],[3,\"action\",[[19,0,[]],[25,\"action\",[[19,0,[]],[19,2,[]]],null]]],[7],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/components/shopping-list-add-modal.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/components/shopping-list-item", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "s0V0HsDS", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"item-view collapsible \",[25,\"if\",[[19,0,[\"editMode\"]],\"closed\"],null]]]],[7],[0,\"\\n  \"],[6,\"input\"],[9,\"type\",\"checkbox\"],[10,\"id\",[26,[\"checked-item-\",[20,[\"item\",\"_sanitizedid\"]]]]],[10,\"name\",[26,[\"checked-item-\",[20,[\"item\",\"_sanitizedid\"]]]]],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"toggleChecked\"],null],null],[10,\"value\",[26,[[20,[\"item\",\"title\"]]]]],[10,\"checked\",[20,[\"item\",\"checked\"]],null],[7],[8],[0,\"\\n  \"],[6,\"label\"],[10,\"for\",[26,[\"checked-item-\",[20,[\"item\",\"_sanitizedid\"]]]]],[7],[1,[20,[\"item\",\"title\"]],false],[8],[0,\"\\n  \"],[6,\"button\"],[9,\"class\",\"btn-flat more-btn right\"],[3,\"action\",[[19,0,[]],\"toggleEdit\"]],[7],[6,\"i\"],[9,\"class\",\"material-icons\"],[7],[0,\"more_vert\"],[8],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"item-edit collapsible \",[25,\"unless\",[[19,0,[\"editMode\"]],\"closed\"],null]]]],[7],[0,\"\\n  \"],[6,\"form\"],[10,\"id\",[26,[\"form-\",[20,[\"item\",\"_sanitizedid\"]]]]],[9,\"class\",\"col s12 tertiary lighter\"],[3,\"action\",[[19,0,[]],\"updateItem\",[19,0,[\"item\",\"title\"]]],[[\"on\"],[\"submit\"]]],[7],[0,\"\\n    \"],[6,\"div\"],[7],[0,\"\\n      \"],[6,\"span\"],[9,\"class\",\"card-title\"],[7],[0,\"\\n        \"],[6,\"button\"],[10,\"id\",[26,[\"close-\",[20,[\"item\",\"_sanitizedid\"]]]]],[9,\"type\",\"button\"],[9,\"class\",\"btn-flat more-btn right\"],[10,\"data-escape\",[26,[[20,[\"item\",\"_sanitizedid\"]]]]],[3,\"action\",[[19,0,[]],\"toggleEdit\"]],[7],[6,\"i\"],[9,\"class\",\"material-icons\"],[7],[0,\"close\"],[8],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"h5\"],[7],[0,\"Edit Item\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"input-field col s12\"],[7],[0,\"\\n          \"],[1,[25,\"input\",null,[[\"value\",\"class\",\"placeholder\",\"autofocus\",\"required\"],[[19,0,[\"item\",\"title\"]],\"validate\",[19,0,[\"item\",\"title\"]],true,true]]],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[1,[25,\"input\",null,[[\"value\",\"type\",\"required\"],[[19,0,[\"item\",\"list\"]],\"hidden\",true]]],false],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"card-action\"],[7],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"button\"],[10,\"data-escape\",[26,[[20,[\"item\",\"_sanitizedid\"]]]]],[3,\"action\",[[19,0,[]],\"removeItem\"]],[7],[0,\"Remove\"],[8],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"submit\"],[10,\"data-escape\",[26,[[20,[\"item\",\"_sanitizedid\"]]]]],[7],[0,\"Update\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/components/shopping-list-item.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/components/shopping-list-list", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "tycF13/Z", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"list-view collapsible \",[25,\"if\",[[19,0,[\"editMode\"]],\"closed\"],null]]]],[7],[0,\"\\n\"],[4,\"link-to\",[\"shopping-list-items\",[19,0,[\"list\",\"_id\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"card-content\"],[3,\"action\",[[19,0,[]],\"listClicked\"]],[7],[0,\"\\n    \"],[6,\"span\"],[9,\"class\",\"card-title activator\"],[7],[1,[20,[\"list\",\"title\"]],false],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat more-btn right\"],[3,\"action\",[[19,0,[]],\"toggleEdit\"],[[\"bubbles\"],[false]]],[7],[6,\"i\"],[9,\"class\",\"material-icons\"],[7],[0,\"more_vert\"],[8],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[6,\"div\"],[9,\"class\",\"card-action\"],[7],[0,\"\\n\"],[4,\"if\",[[19,0,[\"list\",\"checked\"]]],null,{\"statements\":[[0,\"    \"],[6,\"input\"],[9,\"type\",\"checkbox\"],[10,\"id\",[26,[\"checked-list-\",[20,[\"list\",\"_sanitizedid\"]]]]],[10,\"name\",[26,[\"checked-list-\",[20,[\"list\",\"_sanitizedid\"]]]]],[9,\"checked\",\"checked\"],[9,\"disabled\",\"\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[6,\"input\"],[9,\"type\",\"checkbox\"],[10,\"id\",[26,[\"checked-list-\",[20,[\"list\",\"_sanitizedid\"]]]]],[10,\"name\",[26,[\"checked-list-\",[20,[\"list\",\"_sanitizedid\"]]]]],[9,\"disabled\",\"\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[6,\"label\"],[10,\"for\",[26,[\"checked-list-\",[20,[\"list\",\"_sanitizedid\"]]]]],[7],[1,[20,[\"checkedItems\",\"content\"]],false],[0,\" of \"],[1,[20,[\"totalItems\",\"content\"]],false],[0,\" items checked\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"list-edit collapsible \",[25,\"unless\",[[19,0,[\"editMode\"]],\"closed\"],null]]]],[7],[0,\"\\n  \"],[6,\"form\"],[10,\"id\",[26,[\"form-\",[20,[\"list\",\"_sanitizedid\"]]]]],[9,\"class\",\"col s12 white\"],[3,\"action\",[[19,0,[]],\"updateList\",[19,0,[\"list\",\"title\"]]],[[\"on\"],[\"submit\"]]],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"card-content\"],[7],[0,\"\\n      \"],[6,\"span\"],[9,\"class\",\"card-title\"],[7],[0,\"\\n        \"],[6,\"button\"],[10,\"id\",[26,[\"close-\",[20,[\"list\",\"_sanitizedid\"]]]]],[9,\"type\",\"button\"],[9,\"class\",\"btn-flat more-btn right\"],[3,\"action\",[[19,0,[]],\"toggleEdit\"],[[\"bubbles\"],[false]]],[7],[6,\"i\"],[9,\"class\",\"material-icons\"],[7],[0,\"close\"],[8],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"h5\"],[7],[0,\"Edit Shopping List\"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"input-field col s12\"],[7],[0,\"\\n          \"],[1,[25,\"input\",null,[[\"value\",\"class\",\"placeholder\",\"autofocus\",\"required\"],[[19,0,[\"list\",\"title\"]],\"validate\",[19,0,[\"list\",\"title\"]],true,true]]],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"card-action\"],[7],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"button\"],[10,\"data-escape\",[26,[[20,[\"list\",\"_sanitizedid\"]]]]],[3,\"action\",[[19,0,[]],\"removeList\"]],[7],[0,\"Remove\"],[8],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"submit\"],[10,\"data-escape\",[26,[[20,[\"list\",\"_sanitizedid\"]]]]],[7],[0,\"Update\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/components/shopping-list-list.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/components/shopping-list-settings-modal", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "gRGeeFP6", "block": "{\"symbols\":[\"&default\",\"@sync\",\"@closeModal\"],\"statements\":[[11,1],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"modal top-sheet\"],[7],[0,\"\\n  \"],[6,\"form\"],[9,\"id\",\"shopping-list-settings\"],[9,\"class\",\"col s12 white\"],[3,\"action\",[[19,0,[]],[25,\"action\",[[19,0,[]],[19,2,[]],[19,0,[\"settings\"]]],null]],[[\"on\"],[\"submit\"]]],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"modal-content\"],[7],[0,\"\\n        \"],[6,\"h5\"],[7],[0,\"Shopping Lists Settings\"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"input-field col s12\"],[7],[0,\"\\n              \"],[6,\"span\"],[9,\"class\",\"primary-text darker\"],[7],[0,\"Enter a fully qualified URL (including username and password) to a remote IBM Cloudant, Apache CouchDB, or PouchDB database to sync your shopping list.\"],[8],[0,\"\\n              \"],[1,[25,\"input\",null,[[\"value\",\"type\",\"class\",\"placeholder\",\"autofocus\"],[[19,0,[\"settings\",\"remoteDB\"]],\"url\",\"validate\",\"http://username:password@localhost:5984/database\",true]]],false],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"chip\"],[7],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"modal-footer secondary-color\"],[7],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"button\"],[9,\"data-escape\",\"closesettings\"],[3,\"action\",[[19,0,[]],[25,\"action\",[[19,0,[]],[19,3,[]]],null]]],[7],[0,\"Cancel\"],[8],[0,\"\\n      \"],[6,\"button\"],[9,\"class\",\"btn-flat\"],[9,\"type\",\"submit\"],[9,\"data-escape\",\"closesettings\"],[7],[0,\"Sync\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"modal-overlay\"],[3,\"action\",[[19,0,[]],[25,\"action\",[[19,0,[]],[19,3,[]]],null]]],[7],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/components/shopping-list-settings-modal.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "KtpuqnLG", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/index.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/shopping-list-emberjs-pouchdb", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "wsqoITbw", "block": "{\"symbols\":[\"shoppingList\"],\"statements\":[[6,\"div\"],[9,\"id\",\"shopping-lists\"],[7],[0,\"\\n\"],[4,\"each\",[[19,0,[\"model\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[10,\"id\",[26,[[19,1,[\"_sanitizedid\"]]]]],[9,\"class\",\"card collapsible\"],[7],[0,\"\\n    \"],[1,[25,\"shopping-list-list\",null,[[\"list\",\"onRemoveList\",\"onUpdateList\"],[[19,1,[]],\"removeList\",\"updateList\"]]],false],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/shopping-list-emberjs-pouchdb.hbs" } });
});
define("shopping-list-emberjs-pouchdb/templates/shopping-list-items", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "R0gCEMyO", "block": "{\"symbols\":[\"shoppingListItem\"],\"statements\":[[6,\"ul\"],[9,\"id\",\"shopping-list-items\"],[9,\"class\",\"collection\"],[7],[0,\"\\n\"],[4,\"each\",[[19,0,[\"model\"]]],null,{\"statements\":[[0,\"  \"],[6,\"li\"],[10,\"id\",[26,[[19,1,[\"_sanitizedid\"]]]]],[9,\"class\",\"card collection-item\"],[7],[0,\"\\n    \"],[1,[25,\"shopping-list-item\",null,[[\"item\",\"onRemoveItem\",\"onUpdateItem\"],[[19,1,[]],\"removeItem\",\"updateItem\"]]],false],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "shopping-list-emberjs-pouchdb/templates/shopping-list-items.hbs" } });
});


define('shopping-list-emberjs-pouchdb/config/environment', ['ember'], function(Ember) {
  var prefix = 'shopping-list-emberjs-pouchdb';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("shopping-list-emberjs-pouchdb/app")["default"].create({"name":"shopping-list-emberjs-pouchdb","version":"0.0.0+dc2750d6"});
}
//# sourceMappingURL=shopping-list-emberjs-pouchdb.map
