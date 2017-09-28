import Ember from 'ember'

export default Ember.Route.extend({
  model () {
    return this.store
      .findAll('list')
      .then(docs => {
        return docs
      })
  },

  actions: {
    addList (list) {
      this.store
        .createRecord('list', list)
        .save()
        .then(() => {
          this.refresh()
        })
        .catch(console.error)
    },
    removeList (listid) {
      this.store
        .findRecord('list', listid)
        .then(list => {
          list.get('items')
            .then(items => {
              items.forEach(item => {
                Ember.run.once(this, () => {
                  item.deleteRecord()
                  item.save()
                })
              }, this)

              list.deleteRecord()
              list.save()
                .then(() => {
                  this.refresh()
                })
            })
        })
        .catch(console.error)
    },
    updateList (list, defer) {
      this.store
        .findRecord('list', list.get('_id'))
        .then(doc => {
          doc.set('title', list.get('title'))
          doc.save()
            .then(() => {
              defer.resolve()
            })
        })
        .catch(defer.reject)
    }
  }
})
