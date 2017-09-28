import Ember from 'ember'

export default Ember.Route.extend({
  beforeModel () {
    this.replaceWith('shopping-list-emberjs-pouchdb')
  }
})
