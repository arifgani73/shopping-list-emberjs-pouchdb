/* eslint-env node */
'use strict'

module.exports = function (/* environment, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  return {
    short_name: 'Shopper',
    name: 'Shopping List',
    start_url: '/shopping-list-emberjs-pouchdb',
    background_color: '#283b4f',
    theme_color: '#283b4f',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      {
        src: 'favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}
