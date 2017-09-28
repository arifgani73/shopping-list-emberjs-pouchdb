import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('shopping-list-settings-modal', 'Integration | Component | shopping list settings modal', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{shopping-list-settings-modal}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#shopping-list-settings-modal}}
      template block text
    {{/shopping-list-settings-modal}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
