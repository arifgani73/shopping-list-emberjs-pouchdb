/* global cuid */
import DS from 'ember-data'
import Ember from 'ember'

export default DS.Model.extend({
  _id: DS.attr('string', {
    defaultValue () { return 'item:' + cuid() }
  }),
  type: DS.attr('string', {
    defaultValue () { return 'item' }
  }),
  version: DS.attr('number', {
    defaultValue () { return 1 }
  }),
  list: DS.attr('string'),
  title: DS.attr('string'),
  checked: DS.attr('boolean', {
    defaultValue () { return false }
  }),
  createdAt: DS.attr('string', {
    defaultValue () { return new Date().toISOString() }
  }),
  updatedAt: DS.attr('string'),

  _sanitizedid: Ember.computed('_id', function () {
    return this.get('_id').replace(/(:)/gi, '-')
  })
})
