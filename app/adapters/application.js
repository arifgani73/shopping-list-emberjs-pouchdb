import Ember from 'ember'
import DS from 'ember-data'

export default DS.Adapter.extend({
  pouchService: Ember.inject.service('pouch-service'),
  db: Ember.computed(function () {
    return this.get('pouchService.db')
  }),

  shouldReloadAll () {
    return true
  },

  shouldReloadRecord () {
    return true
  },

  createRecord (store, type, snapshot) {
    let doc = this.serialize(snapshot, { includeId: true })
    return this.get('db')
      .put(doc)
      .then(response => {
        doc._id = response.id
        return doc
      })
  },

  findRecord (store, type, id) {
    return this.get('db')
      .get(id)
  },

  findAll (store, type, sinceToken, snapshot) {
    let selector = { type: type.modelName }
    if (snapshot.adapterOptions && snapshot.adapterOptions.list_id) {
      selector.list = snapshot.adapterOptions.list_id
    }
    return this.get('db')
      .find({ selector: selector })
      .then(docs => {
        const d = docs.docs
        d.sort(function (doca, docb) {
          let a = null
          let b = null
          if (type.modelName === 'list') {
            // sort list by date
            b = doca.updatedAt || doca.createdAt
            a = docb.updatedAt || docb.createdAt
          } else {
            // sort items by name
            a = doca.title.toLowerCase()
            b = docb.title.toLowerCase()
          }
          if (a < b) return -1
          else if (a > b) return 1
          else return 0
        })
        return d
      })
  },

  updateRecord (store, type, snapshot) {
    let data = this.serialize(snapshot, { includeId: true })
    let db = this.get('db')
    return db.get(data._id)
      .then(doc => {
        data._rev = doc._rev
        data.updatedAt = new Date().toISOString()
        return data
      })
      .then(d => {
        return db.put(d)
          .then(() => {
            return null
          })
      })
  },

  deleteRecord (store, type, snapshot) {
    let db = this.get('db')
    return db.get(snapshot.id)
      .then(doc => {
        if (doc.type === 'list') {
          // find all items beloging to list
          return db.find({
            selector: {
              type: 'item',
              list: snapshot.id
            }
          }).then(docs => {
            var items = docs ? docs.docs || docs : docs
            if (items && items.length) {
              // remove all items belonging to list
              return db.bulkDocs(items.map(item => {
                item._deleted = true
              })).then(() => {
                // remove list
                return this._delete(db, doc._id, doc._rev)
              })
            } else {
              // remove list
              return this._delete(db, doc._id, doc._rev)
            }
          })
        } else {
          // remove item
          return this._delete(db, doc._id, doc._rev)
        }
      })
  },

  _delete (db, id, rev) {
    return db.remove(id, rev)
    .then(() => {
      return null
    })
  }
})
