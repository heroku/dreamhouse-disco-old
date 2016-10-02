
'use strict'

var fmt = require('logfmt')
let config = require('../config')
let r = require('request-promise')

const Casey = {}

// returns Promise that resolves to string
Casey.createShortCodeFor = function(request) {
  // POST https://casey/shortcodes/
  // body: { request: request }
  // response: { shortCode: shortCode, request: request, seedTrack: null, playlistUri: null }
  // create new short code
  // save short code and track ID to new DB record
  const opts = {
    method: 'POST',
    uri: `${config.caseyUrl}/shortcodes`,
    body: { request },
    json: true
  }
  return r(opts)
  .then( response => response.shortCode )
  .catch( err => {
    const e = new Error(`Error creating short code with Casey: ${JSON.stringify(err)}`)
    fmt.log({ type: 'error', msg: e })
    return e
  })

  // return promise of short code string when request is done
}

// returns Promise that resolves or rejects
Casey.setPlaylistFor = function(shortCode, playlistUri, seedTrack) {
  // PATCH https://casey/shortcodes/{shortCode}/
  // body: { seedTrack: track, playlistUri: playlist }
  // response: { shortCode: shortCode, request: request, seedTrack: track, playlistUri: playlist }
  // for given short code, set playlist uri in DB

  // resolve promise if request successful, else reject promise
  const opts = {
    method: 'PATCH',
    uri: `${config.caseyUrl}/shortcodes/${shortCode}`,
    body: {
      seedTrack,
      playlistUri
    },
    json: true
  }
  return r(opts)
  .then(response => response)
  .catch(err => {
    const e = new Error(`Error updating playlist for short code with Casey: ${JSON.stringinfy(err)}`)
    fmt.log({ type: 'error', msg: err })
    return e
  })
}


module.exports = Casey
