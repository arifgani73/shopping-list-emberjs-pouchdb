'use strict';

define('shopping-list-emberjs-pouchdb/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('adapters/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/application.js should pass ESLint\n\n');
  });

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('components/shopping-list-add-modal.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/shopping-list-add-modal.js should pass ESLint\n\n');
  });

  QUnit.test('components/shopping-list-item.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/shopping-list-item.js should pass ESLint\n\n19:10 - Unexpected console statement. (no-console)');
  });

  QUnit.test('components/shopping-list-list.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/shopping-list-list.js should pass ESLint\n\n24:10 - Unexpected console statement. (no-console)');
  });

  QUnit.test('components/shopping-list-settings-modal.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/shopping-list-settings-modal.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/application.js should pass ESLint\n\n');
  });

  QUnit.test('models/item.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/item.js should pass ESLint\n\n');
  });

  QUnit.test('models/list.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/list.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/index.js should pass ESLint\n\n');
  });

  QUnit.test('routes/shopping-list-emberjs-pouchdb.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/shopping-list-emberjs-pouchdb.js should pass ESLint\n\n20:16 - Unexpected console statement. (no-console)\n42:16 - Unexpected console statement. (no-console)');
  });

  QUnit.test('routes/shopping-list-items.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/shopping-list-items.js should pass ESLint\n\n28:16 - Unexpected console statement. (no-console)\n40:14 - Unexpected console statement. (no-console)');
  });

  QUnit.test('serializers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/application.js should pass ESLint\n\n');
  });

  QUnit.test('services/pouch-service.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/pouch-service.js should pass ESLint\n\n19:9 - Unexpected console statement. (no-console)\n24:14 - Unexpected console statement. (no-console)\n29:9 - Unexpected console statement. (no-console)\n33:11 - Unexpected console statement. (no-console)\n72:7 - Unexpected console statement. (no-console)\n130:21 - Unexpected console statement. (no-console)\n149:11 - Unexpected console statement. (no-console)');
  });
});
define('shopping-list-emberjs-pouchdb/tests/helpers/destroy-app', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = destroyApp;
  function destroyApp(application) {
    Ember.run(application, 'destroy');
  }
});
define('shopping-list-emberjs-pouchdb/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'shopping-list-emberjs-pouchdb/tests/helpers/start-app', 'shopping-list-emberjs-pouchdb/tests/helpers/destroy-app'], function (exports, _qunit, _startApp, _destroyApp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _startApp.default)();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return resolve(afterEach).then(function () {
          return (0, _destroyApp.default)(_this.application);
        });
      }
    });
  };

  var resolve = Ember.RSVP.resolve;
});
define('shopping-list-emberjs-pouchdb/tests/helpers/resolver', ['exports', 'shopping-list-emberjs-pouchdb/resolver', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _resolver, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var resolver = _resolver.default.create();

  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };

  exports.default = resolver;
});
define('shopping-list-emberjs-pouchdb/tests/helpers/start-app', ['exports', 'shopping-list-emberjs-pouchdb/app', 'shopping-list-emberjs-pouchdb/config/environment'], function (exports, _app, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = startApp;
  function startApp(attrs) {
    var attributes = Ember.merge({}, _environment.default.APP);
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

    return Ember.run(function () {
      var application = _app.default.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
      return application;
    });
  }
});
define('shopping-list-emberjs-pouchdb/tests/integration/components/shopping-list-add-modal-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForComponent)('shopping-list-add-modal', 'Integration | Component | shopping list add modal', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template({
      "id": "u2D8ZZkD",
      "block": "{\"symbols\":[],\"statements\":[[1,[18,\"shopping-list-add-modal\"],false]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template({
      "id": "wlsjdll6",
      "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"shopping-list-add-modal\",null,null,{\"statements\":[[0,\"      template block text\\n\"]],\"parameters\":[]},null],[0,\"  \"]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('shopping-list-emberjs-pouchdb/tests/integration/components/shopping-list-item-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForComponent)('shopping-list-item', 'Integration | Component | shopping list item', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template({
      "id": "NOyKegpg",
      "block": "{\"symbols\":[],\"statements\":[[1,[18,\"shopping-list-item\"],false]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template({
      "id": "NM5ZfZ1v",
      "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"shopping-list-item\",null,null,{\"statements\":[[0,\"      template block text\\n\"]],\"parameters\":[]},null],[0,\"  \"]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('shopping-list-emberjs-pouchdb/tests/integration/components/shopping-list-list-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForComponent)('shopping-list-list', 'Integration | Component | shopping list list', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template({
      "id": "LueuwdDv",
      "block": "{\"symbols\":[],\"statements\":[[1,[18,\"shopping-list-list\"],false]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template({
      "id": "BALGTiVP",
      "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"shopping-list-list\",null,null,{\"statements\":[[0,\"      template block text\\n\"]],\"parameters\":[]},null],[0,\"  \"]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('shopping-list-emberjs-pouchdb/tests/integration/components/shopping-list-settings-modal-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForComponent)('shopping-list-settings-modal', 'Integration | Component | shopping list settings modal', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template({
      "id": "WPFWy5c2",
      "block": "{\"symbols\":[],\"statements\":[[1,[18,\"shopping-list-settings-modal\"],false]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template({
      "id": "1C5R4/YF",
      "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"shopping-list-settings-modal\",null,null,{\"statements\":[[0,\"      template block text\\n\"]],\"parameters\":[]},null],[0,\"  \"]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('shopping-list-emberjs-pouchdb/tests/test-helper', ['shopping-list-emberjs-pouchdb/tests/helpers/resolver', 'ember-qunit', 'ember-cli-qunit'], function (_resolver, _emberQunit, _emberCliQunit) {
  'use strict';

  (0, _emberQunit.setResolver)(_resolver.default);
  (0, _emberCliQunit.start)();
});
define('shopping-list-emberjs-pouchdb/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('helpers/destroy-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/module-for-acceptance.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/start-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/shopping-list-add-modal-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/shopping-list-add-modal-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/shopping-list-item-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/shopping-list-item-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/shopping-list-list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/shopping-list-list-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/shopping-list-settings-modal-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/shopping-list-settings-modal-test.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/item-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/item-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/list-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/index-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/list-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/shopping-list-emberjs-pouchdb-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/shopping-list-emberjs-pouchdb-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/pouch-service-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/pouch-service-test.js should pass ESLint\n\n');
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/adapters/application-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('adapter:application', 'Unit | Adapter | application', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/models/item-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('item', 'Unit | Model | item', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/models/list-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('list', 'Unit | Model | list', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/routes/index-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('route:index', 'Unit | Route | index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/routes/list-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('route:list', 'Unit | Route | list', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/routes/shopping-list-emberjs-pouchdb-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('route:shopping-list-emberjs-pouchdb', 'Unit | Route | shopping list emberjs pouchdb', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/serializers/application-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('application', 'Unit | Serializer | application', {
    // Specify the other units that are required for this test.
    needs: ['serializer:application']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
define('shopping-list-emberjs-pouchdb/tests/unit/services/pouch-service-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('service:pouch-service', 'Unit | Service | pouch service', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });
});
require('shopping-list-emberjs-pouchdb/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
