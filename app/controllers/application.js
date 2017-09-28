import Ember from 'ember'

export default Ember.Controller.extend({
  router: Ember.inject.service(),
  pouchService : Ember.inject.service(),

  isItemsList: Ember.computed.equal('router.currentRouteName', 'shopping-list-items'),

  listId: Ember.computed('router.currentURL', function () {
    let url = this.get('router.currentURL')
    return url && url.indexOf('/list/') === 0 ? url.replace('/list/', '') : null
  }),

  init () {
    this.get('pouchService').sync(null, () => {
      this.send('refreshRoute')
    })
  },

  actions: {
    goBack () {
      Ember.$('#header-title').text('Shopping Lists')
    },

    refreshRoute () {
      let route = Ember.getOwner(this).lookup(`route:${this.get('router.currentRouteName')}`)
      return route.refresh()
    },

    sync (settings) {
      this.get('pouchService')
        .sync(settings ? settings.remoteDB : '', () => {
          this.send('refreshRoute')
        })
        .then(() => {
          this.send('closeSettingsModal')
        })
    },

    openSettingsModal () {
      Ember.$('body').addClass('shopping-list-settings-modal')
    },

    closeSettingsModal () {
      Ember.$('body').removeClass('shopping-list-settings-modal')
    },

    openAddModal () {
      document.getElementById('shopping-list-add-form').reset()
      Ember.$('body').addClass('shopping-list-add-modal')
    },

    closeAddModal (newRecord) {
      if (newRecord) {
        if (newRecord.type === 'item') {
          this.send('addItem', newRecord)
        } else {
          this.send('addList', newRecord)
        }
      }

      Ember.$('body').removeClass('shopping-list-add-modal')
    }
  }
})
