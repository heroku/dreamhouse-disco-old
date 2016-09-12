
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
let request = require('request')

class PlaylistController {

  constructor() {
    this.root = '/playlist'
    this.router = express.Router()
    this.db = db
  }

  routes() {
    this.router.get('/:playlistId', this._getPlaylist.bind(this))
    this.router.get('/', this._get.bind(this))

    return this.router
  }

  _get(req, res) {
    res.send('hello world')
  }

  _getPlaylist(req, res) {

    this.db.Account.findOne({ where: { id: req.session.spotifyId } })
      .then(function(acct) {
        const opts = { auth: { 'bearer': acct.get('access_token') } }
        const playlistUrl = 'https://api.spotify.com/v1/users/' + acct.get('id') + '/playlists/' + req.params.playlistId

        request.get(playlistUrl, opts, function(error, response, body) {
          const playlist = JSON.parse(body)
          // TODO: error handling

          // edit returned playlist to identify current playing track
          res.json(playlist)
        })
      })

    // let opts = {
    //   where: { key: req.params.accountKey },
    //   include: [{
    //     model: this.db.Playlist,
    //     where: { active: true },
    //     include: [{ model: this.db.Track }]
    //   }]
    // }
    //
    // this.db.Account.findOne(opts).call('toJSON').then(function(account) {
    //   let playlist = account.Playlists[0]
    //
    //   playlist.tracks = _.reduce(playlist.Tracks, function(m, t) {
    //     m.push(_.omit(t, _.isNull))
    //
    //     delete t.PlaylistTracks
    //     return m
    //   }, [])
    //
    //   delete playlist.Tracks
    //
    //   res.json(playlist)
    // }).catch(function(err) {
    //   res.status(204).end();
    // })
  }

}

module.exports = new PlaylistController()
