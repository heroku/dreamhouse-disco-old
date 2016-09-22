
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
let request = require('request')
let getValidToken = require('../lib/token')

class PlaylistController {

  constructor() {
    this.root = '/playlist'
    this.router = express.Router()
    this.db = db
  }

  routes() {
    this.router.get('/', this._getPlaylist.bind(this))

    return this.router
  }

  _getPlaylist(req, res) {

    this.db.Account.findOne({ })
      .then(function(acct) {

        getValidToken(acct.get('oauth_token'))
        .then(function(token) {

          const opts = { auth: { 'bearer': token } }
          const playlistUrl = 'https://api.spotify.com/v1/users/' + acct.get('id') + '/playlists/' + acct.get('playlist_id')

          request.get(playlistUrl, opts, function(error, response, body) {
            const playlist = JSON.parse(body)
            // TODO: error handling

            // edit returned playlist to identify current playing track
            res.json(playlist)
          })
        })
      })
  }

}

module.exports = new PlaylistController()
