import Ember from 'ember'

export default Ember.Route.extend({
  listId: null,

  model (params) {
    return this.store
      .findRecord('list', params.list_id)
      .then(list => {
        this.set('listId', params.list_id)
        return list.get('items')
      })
  },

  activate () {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  },

  actions: {
    addItem (item) {
      this.store
        .createRecord('item', item)
        .save()
        .then(() => {
          this.refresh()
        })
        .catch(console.error)
    },
    removeItem (itemid) {
      this.store
      .findRecord('item', itemid)
      .then(item => {
        item.deleteRecord()
        item.save()
          .then(() => {
            this.refresh()
          })
      })
      .catch(console.error)
    },
    updateItem (item, defer) {
      this.store
        .findRecord('item', item.get('_id'))
        .then(doc => {
          doc.set('title', item.get('title'))
          doc.set('checked', item.get('checked'))
          doc.save()
            .then(() => {
              return defer.resolve()
            })
        })
        .catch(defer.reject)
    }
  }
})
