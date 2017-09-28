import Ember from 'ember'

export default Ember.Component.extend({
  editMode: false,
  list: {},

  totalItems: Ember.computed('list.totalItems', function () {
    return this.get('list.totalItems')
  }),

  checkedItems: Ember.computed('list.checkedItems', function () {
    return this.get('list.checkedItems')
  }),

  actions: {
    toggleEdit () {
      this.toggleProperty('editMode')
    },
    updateList () {
      let defer = Ember.RSVP.defer()
      let self = this
      defer.promise.then(() => {
        self.set('editMode', false)
      }, console.error)
      this.sendAction('onUpdateList', this.get('list'), defer)
    },
    removeList () {
      this.sendAction('onRemoveList', this.get('list._id'))
    },
    listClicked () {
      Ember.$('#header-title').text(this.get('list.title'))
    }
  }
})
