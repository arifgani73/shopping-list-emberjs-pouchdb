import Ember from 'ember'

export default Ember.Component.extend({
  pouchService : Ember.inject.service(),

  settings: Ember.computed('pouchService.settings', function () {
    return this.get('pouchService.settings')
  })
})
