/* global Promise */
import Ember from 'ember'
import PouchDB from 'npm:pouchdb-browser'
import plugin from 'npm:pouchdb-find'
import config from 'shopping-list-emberjs-pouchdb/config/environment'

PouchDB.plugin(plugin)

export default Ember.Service.extend({
  store: Ember.inject.service(),

  init () {
    let dbname = config.pouchDBName || 'shopping'
    let db = new PouchDB(dbname)
    this.set('db', db)

    db.info()
      .then(info => {
        console.log('db.info', info)
        return db.createIndex({
          index: { fields: ['type'] }
        })
      })
      .catch(console.error)

    db.get('_local/user')
      .then(doc => {
        this.set('settings', doc)
        console.log('db.settings', this.get('settings'))
      })
      .catch(err => {
        if (err) {
          console.error(err)
        }
        let settings = this.get('settings')
        settings['_id'] = '_local/user'
        db.put(settings)
      })
  },

  db: null,

  settings: {},

  _dbsync: null,

  syncStatus: null,

  syncStatusUpdate: Ember.observer('syncStatus', function () {
    const status = this.get('syncStatus')
    if (status === 'syncing') {
      Ember.$('body').addClass('shopping-list-sync')
      Ember.$('body').removeClass('shopping-list-error-sync')
    } else if (status === 'error') {
      Ember.$('body').removeClass('shopping-list-sync')
      Ember.$('body').addClass('shopping-list-error-sync')
    } else {
      Ember.$('body').removeClass('shopping-list-sync')
      Ember.$('body').removeClass('shopping-list-error-sync')
    }
  }),

  resetStore () {
    this.get('store').unloadAll('list')
    this.get('store').unloadAll('item')
    this.get('store').findAll('list')
    this.get('store').findAll('item')
  },

  handleChanges (err, updates, onchange) {
    if (err) {
      console.error(err)
    } else {
      let store = this.get('store')

      updates.forEach(update => {
        if (update._deleted) {
          let record = store.peekRecord(update.type, update._id)
          if (record) {
            store.unloadRecord(record)
          }
        }
        if (update.type === 'item') {
          let record = store.peekRecord('list', update.list)
          if (record) {
            store.unloadRecord(record)
          }
        }
      })
    }

    if (typeof onchange === 'function') {
      onchange(err, updates)
    }
  },

  sync (remoteDB, onchange) {
    const id = '_local/user'
    const db = this.get('db')
    this.set('syncStatus', 'syncing')
    return db.get(id)
      .then(doc => {
        if (typeof remoteDB === 'string') {
          doc.remoteDB = remoteDB
          this.set('settings', doc)
          return db.put(doc)
        } else {
          remoteDB = this.get('settings.remoteDB')
        }
        return doc
      })
      .then(() => {
        if (this.get('_dbsync')) {
          this.get('_dbsync').cancel()
        }
        if (remoteDB) {
          return new Promise((resolve, reject) => {
            // do one-off sync from the server until completion
            db.sync(remoteDB)
              .on('complete', info => {
                // then two-way, continuous, retriable sync
                let dbsync = db.sync(remoteDB, { live: true, retry: true })
                  .on('change', info => {
                    // incoming changes only
                    if (info.direction === 'pull' && info.change && info.change.docs) {
                      this.handleChanges(null, info.change.docs, onchange)
                    }
                  })
                  .on('error', err => {
                    console.warn(err)
                    this.handleChanges(err, null, onchange)
                  })

                this.set('_dbsync', dbsync)
                this.set('syncStatus', '')
                return resolve(info)
              })
              .on('error', err => {
                this.set('syncStatus', 'error')
                return reject(err)
              })
          })
        } else {
          this.set('syncStatus', '')
        }
      })
      .catch(err => {
        if (err) {
          console.error(err)
        }
        this.set('syncStatus', 'error')
      })
  }
})
