/* global cuid */
import DS from 'ember-data'
import Ember from 'ember'

export default DS.Model.extend({
  _id: DS.attr('string', {
    defaultValue () { return 'list:' + cuid() }
  }),
  type: DS.attr('string', {
    defaultValue () { return 'list' }
  }),
  version: DS.attr('number', {
    defaultValue () { return 1 }
  }),
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
  }),

  items: Ember.computed(function () {
    let promise = this.get('store')
      .findAll('item')
      .then(items => {
        return items
          .filter(item => item.get('list') === this.get('_id'))
      })
    return DS.PromiseObject.create({promise})
  }).volatile(),

  totalItems: Ember.computed('items', function () {
    let store = this.get('store')
    if (store) {
      let promise = store.findAll('item')
        .then(items => {
          if (items && items.length) {
            return items
              .filter(item => item.get('list') === this.get('_id'))
              .length
          } else {
            return 0
          }
        })
      return DS.PromiseObject.create({promise})
    } else {
      return 0
    }
  }).volatile(),

  checkedItems: Ember.computed('items', function () {
    let store = this.get('store')
    if (store) {
      let promise = store
        .findAll('item')
        .then(items => {
          if (items && items.length) {
            return items
              .filter(item => item.get('list') === this.get('_id') && item.get('checked'))
              .length
          } else {
            return 0
          }
        })
      return DS.PromiseObject.create({promise})
    } else {
      return 0
    }
  }).volatile()
})
