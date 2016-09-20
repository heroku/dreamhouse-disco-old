
'use strict'

let config = require('../config')
let express = require('express')
let db = require('../models')
let oauth2 = require('simple-oauth2')(config.spotify)
let _ = require('lodash')
let request = require('request')
var fmt = require('logfmt')

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
    let protocol = req.get('X-Forwarded-Proto') || req.protocol
    let authUri = oauth2.authCode.authorizeURL({
      redirect_uri: protocol + '://' + req.get('host') + '/api/auth/callback',
      response_type: 'code',
      scope: 'playlist-modify-public playlist-modify-private',
      show_dialog: true
    })
    res.redirect(authUri)
  }

  _getCallback(req, res) {
    var code = req.query.code

    let protocol = req.get('X-Forwarded-Proto') || req.protocol
    oauth2.authCode.getToken({
      code: code,
      redirect_uri: protocol + '://' + req.get('host') + '/api/auth/callback'
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
            token_type: token.token.token_type
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
              // Register with Travolta
              const travoltaOpts = {
                json: true,
                body: { app_name: req.hostname }
              }
              request.post(`${process.env.TRAVOLTA_REGISTER_URL}`, travoltaOpts, function(error, response, body) {
                if (!error && response.statusCode == 201) {
                  // Set session information
                  req.session.spotifyId       = account.get('id');
                  req.session.smsNumber       = account.get('number');
                  req.session.display_number  = account.get('display_number');
                  req.session.display_name    = account.get('display_name');
                  req.session.save();

                  // Redirect to React auth route
                  res.redirect(config.url +
                    `/#/auth?id=${encodeURIComponent(account.get('id'))}` +
                    `&number=${encodeURIComponent(account.get('number'))}` +
                    `&name=${encodeURIComponent(account.get('display_name'))}` +
                    `&displayNumber=${encodeURIComponent(account.get('display_number'))}`
                  )

                  fmt.log({
                    type: 'info',
                    msg: `Registered with Travolta: ${JSON.stringify(body)}`
                  })
                } else {
                  // Set session information
                  req.session.spotifyId       = account.get('id');
                  req.session.smsNumber       = account.get('number');
                  req.session.display_number  = account.get('display_number');
                  req.session.display_name    = account.get('display_name');
                  req.session.save();

                  // Redirect to React auth route
                  res.redirect(config.url +
                    `/#/auth?id=${encodeURIComponent(account.get('id'))}` +
                    `&number=${encodeURIComponent(account.get('number'))}` +
                    `&name=${encodeURIComponent(account.get('display_name'))}` +
                    `&displayNumber=${encodeURIComponent(account.get('display_number'))}`
                  )
                  console.log(body)
                  fmt.log({
                    type: 'warning',
                    msg: `Registration with Travolta failed (${body.status}: ${body.error}). FB chat track requests will not work.`
                  })
                }
              })


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
            .catch(function(err) {
              fmt.error(err)
            })
        }
      })
    }
  }

}

module.exports = new AuthController()
