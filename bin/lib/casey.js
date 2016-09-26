
'use strict'

var fmt = require('logfmt')
let config = require('../config')

const Casey = {}

// returns Promise that resolves to string
Casey.createShortCodeFor = function(track) {
  // POST https://casey/shortcodes/
  // body: { seedTrackId: track }
  // response: { shortCode: shortCode, seedTrackId: track, playlistUri: null }
  // create new short code
  // save short code and track ID to new DB record

  // return promise of short code string when request is done
}

// returns Promise that resolves or rejects
Casey.setPlaylistFor = function(shortCode, playlist) {
  // PATCH https://casey/shortcodes/{shortCode}/
  // body: { playlistUri: playlist }
  // response: { shortCode: shortCode, seedTrackId: track, playlistUri: playlist }
  // for given short code, set playlist uri in DB

  // resolve promise if request successful, else reject promise
}


module.exports = Casey
