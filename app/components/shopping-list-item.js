import Ember from 'ember'

export default Ember.Component.extend({
  editMode: false,
  item: {},
  actions: {
    toggleEdit () {
      this.toggleProperty('editMode')
    },
    toggleChecked () {
      this.set('item.checked', !this.get('item.checked'))
      this.send('updateItem')
    },
    updateItem () {
      let defer = Ember.RSVP.defer()
      let self = this
      defer.promise.then(() => {
        self.set('editMode', false)
      }, console.error)
      this.sendAction('onUpdateItem', this.get('item'), defer)
    },
    removeItem () {
      this.sendAction('onRemoveItem', this.get('item._id'))
    }
  }
})
