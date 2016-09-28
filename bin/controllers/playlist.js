
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
let request = require('request')
let getValidToken = require('../lib/token')
var fmt = require('logfmt')

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

        getValidToken(acct)
        .then(function(token) {

          const opts = { auth: { 'bearer': token } }
          const playlistUrl = 'https://api.spotify.com/v1/users/' + acct.get('id') + '/playlists/' + acct.get('playlist_id')

          request.get(playlistUrl, opts, function(error, response, body) {
            const playlist = JSON.parse(body)
            if (error || response.statusCode != 200) {
              fmt.log({
                type: 'warning',
                msg: `Error: ${JSON.stringify(error || playlist)}`
              })

              // return faked empty playlist
              res.json( { tracks: { items: [] } } )
              return
            }
            // TODO: better error handling

            res.json(playlist)
          })
        })
      })
  }

}

module.exports = new PlaylistController()
