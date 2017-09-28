import Ember from 'ember'

export default Ember.Component.extend({
  isItemsList: false,
  listId: null,
  newRecord: Ember.computed('isItemsList', 'listId', function () {
    let record = { type: this.get('isItemsList') ? 'item' : 'list' }
    if (this.get('listId')) {
      record.list = this.get('listId')
    }
    return record
  })
})
