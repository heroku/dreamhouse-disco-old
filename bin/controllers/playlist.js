
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
let request = require('request')
let getValidToken = require('../lib/token')
var fmt = require('logfmt')
let config = require('../config')

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

        const opts = { auth: { 'bearer': token }, json: true }
        if (!acct.get('playlist_id') || _.isEmpty(acct.get('playlist_id'))) {
          // No Playlist ID found in DB
          // find or create playlist
          // First, get list of user's playlists
          const playlistsUrl = `https://api.spotify.com/v1/users/${acct.get('id')}/playlists`
          request.get(playlistsUrl, opts, function(error, response, body) {
            if (error || response.statusCode != 200) {
              fmt.log({
                type: 'error',
                msg: `Error: ${JSON.stringify(error || body)}`
              })
              return
            }

            let playlistFound = false;
            let idx = 0;
            while (!playlistFound && idx < body.items.length) {
              if (body.items[idx].name === config.spotify.playlistName) {
                // Found a playlist with a matching name
                playlistFound = true
                const playlistTracksHref = body.items[idx].tracks.href
                
                acct.update({
                  playlist_id: body.items[idx].id
                })
                .then(() => {
                  request.get(playlistTracksHref, opts, function(error, response, body) {
                    if (error || (response.statusCode < 200 && response.statusCode >= 300)) {
                      const msg = `Error getting playlist tracks: ${JSON.stringify(error || body)}`
                      fmt.log({
                        type: 'error',
                        msg: msg
                      })
                      res.status(500).json({ error: msg })

                    } else {
                      res.json({ tracks: body })
                    }
                  })
                })
              }
              idx++
            }

            if (!playlistFound) {
              // Create a playlist, write its ID to DB, and return it
              const createOpts = Object.assign(opts, { body: { name: config.spotify.playlistName } })
              request.post(playlistsUrl, createOpts, function(error, response, body) {
                if (error || (response.statusCode < 200 && response.statusCode >= 300)) {
                  const msg = `Error creating playlist: ${JSON.stringify(error || body)}`
                  fmt.log({
                    type: 'error',
                    msg: msg
                  })
                  res.status(500).json({ error: msg })

                } else {

                  fmt.log({
                    type: 'info',
                    msg: `No playlist found. Created one named '${config.spotify.playlistName}'`
                  })

                  acct.update({
                    playlist_id: body.id
                  })
                  .then(() => {
                    res.json(body)
                  })

                }
              })
            }
          })

        } else {
          // Playlist ID exists in DB

          const playlistTracksHref = `https://api.spotify.com/v1/users/${acct.get('id')}/playlists/${acct.get('playlist_id')}/tracks`
          request.get(playlistTracksHref, opts, function(error, response, body) {
            if (error || (response.statusCode < 200 && response.statusCode >= 300)) {
              const msg = `Error getting playlist tracks: ${JSON.stringify(error || body)}`
              fmt.log({
                type: 'error',
                msg: msg
              })
              res.status(500).json({ error: msg })

            } else {

              res.json({ tracks: body })
            }
          })
        }
      })
    })
  }

}

module.exports = new PlaylistController()
