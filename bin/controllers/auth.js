
'use strict'

let config = require('../config')
let express = require('express')
let db = require('../models')
let oauth2 = require('simple-oauth2')(config.spotify)
let _ = require('lodash')
let request = require('request')
var fmt = require('logfmt')

const number = {
  s7509896: '+14152148408',
  s37078794: '+14159360869',
  1293000875: { number: '2066934726', displayNumber: '206MYDISCO' }
}

class AuthController {

  constructor() {
    this.root = '/auth'
    this.router = express.Router()
    this.db = db
  }

  routes() {
    this.router.get('/', this._get.bind(this))
    this.router.get('/callback', this._getCallback.bind(this))

    return this.router
  }

  _get(req, res) {
    let authUri = oauth2.authCode.authorizeURL({
      redirect_uri: req.protocol + '://' + req.get('host') + '/api/auth/callback',
      response_type: 'code',
      scope: 'user-read-private playlist-modify-public playlist-modify-private',
      show_dialog: true
    })
    res.redirect(authUri)
  }

  _getCallback(req, res) {
    var code = req.query.code

    oauth2.authCode.getToken({
      code: code,
      redirect_uri: req.protocol + '://' + req.get('host') + '/api/auth/callback'
    }, saveToken)

    function saveToken(error, result) {
      if (error) { console.error('Access Token Error', error) }

      var token = oauth2.accessToken.create(result)

      var opts = {
        auth: { 'bearer': token.token.access_token },
        json: true
      }

      request.get('https://api.spotify.com/v1/me/', opts, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var rawUser = _.merge(body, {
            access_token: token.token.access_token,
            refresh_token: token.token.refresh_token,
            expires_at: token.token.expires_at,
            token_type: token.token.token_type,
            number: number[body.id].number,
            display_number: number[body.id].displayNumber
          })

          db.Account.upsert(rawUser)
            .then(function(account) {
              fmt.log({
                type: 'info',
                msg: `User has been created and authenticated - ${rawUser.id}`
              })

              return db.Account.findOne({
                where: { id: rawUser.id },
                include: [{ model: db.Playlist }]
              })
            })
            .then(function(account) {
              // Set session information
              // Save to session store
              req.session.spotifyId    = account.get('id');
              req.session.smsNumber    = account.get('display_number');
              req.session.display_name = account.get('display_name');
              req.session.save();

              // if (account.get('Playlists').length > 0) return

              // Create a default playlist if the user doesn't have any playlists
              // return db.Playlist.create({
              //     name: 'Default Playlist',
              //     description: 'The Default Playlist',
              //     active: true
              //   })
              //   .then(function(playlist) {
              //     fmt.log({
              //       type: 'info',
              //       msg: `a default playlist has been created/updated`
              //     })
              //
              //     return account.addPlaylist(playlist)
              //   })
            })
            .finally(function() {
              res.redirect(config.url + `/#/auth?id=${rawUser.id}&number=${rawUser.display_number}&name=${rawUser.display_name}`)
            })
            .catch(function(err) {
              fmt.error(err)
            })
        }
      })
    }
  }

}

module.exports = new AuthController()
