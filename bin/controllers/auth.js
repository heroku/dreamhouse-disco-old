
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
    this.router.get('/logout', this._getLogout.bind(this))

    return this.router
  }

  _get(req, res) {
    // If account already exists, just login
    db.Account.findOne({ })
    .then(function(acct) {
      if (acct) {

        // Set session information
        req.session.spotifyId       = acct.get('id');
        req.session.smsNumber       = acct.get('number');
        req.session.display_number  = acct.get('display_number');
        req.session.display_name    = acct.get('display_name');
        req.session.save();

        // Redirect to React auth route
        res.redirect(config.url +
          `/auth?id=${encodeURIComponent(acct.get('id'))}` +
          `&number=${encodeURIComponent(acct.get('number'))}` +
          `&name=${encodeURIComponent(acct.get('display_name'))}` +
          `&displayNumber=${encodeURIComponent(acct.get('display_number'))}` +
          `&roomName=${encodeURIComponent(acct.get('travolta_room_name'))}` +
          `&orgName=${encodeURIComponent(acct.get('salesforce_org'))}`
        )
      } else {

        // Do Spotify OAuth
        let protocol = req.get('X-Forwarded-Proto') || req.protocol
        let authUri = oauth2.authCode.authorizeURL({
          redirect_uri: protocol + '://' + req.get('host') + '/api/auth/callback',
          response_type: 'code',
          scope: 'playlist-modify-public playlist-modify-private user-read-private',
          show_dialog: true
        })
        res.redirect(authUri)
      }
    })
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
          var rawUser = _.merge(body, { oauth_token: result })

          db.Account.upsert(rawUser)
            .then(function(account) {
              fmt.log({
                type: 'info',
                msg: `User has been created and authenticated - ${rawUser.id}`
              })

              return db.Account.findOne({ })
              .then(function(acct) {
                return acct
              })
            })
            .then(function(account) {

              // Register with Travolta
              const travoltaOpts = {
                json: true,
                body: { app_name: req.hostname }
              }
              request.post(`${config.travolta.registerUrl}`, travoltaOpts, function(error, response, body) {
                if (!error && response.statusCode == 201) {

                  // Save Travolta room name and token
                  account.update({
                    travolta_token: body.token,
                    travolta_room_name: body.room_name,
                    salesforce_org: body.salesforce_org,
                    number: body.phone_number,
                    display_number: body.display_phone_number
                  })
                  .then(function() {
                    // Set session information
                    req.session.spotifyId       = account.get('id');
                    req.session.smsNumber       = account.get('number');
                    req.session.display_number  = account.get('display_number');
                    req.session.display_name    = account.get('display_name');
                    req.session.save();

                    // Redirect to React auth route
                    res.redirect(config.url +
                      `/auth?id=${encodeURIComponent(account.get('id'))}` +
                      `&number=${encodeURIComponent(account.get('number'))}` +
                      `&name=${encodeURIComponent(account.get('display_name'))}` +
                      `&displayNumber=${encodeURIComponent(account.get('display_number'))}` +
                      `&roomName=${encodeURIComponent(account.get('travolta_room_name'))}` +
                      `&orgName=${encodeURIComponent(account.get('salesforce_org'))}`
                    )

                    fmt.log({
                      type: 'info',
                      msg: `Registered with Travolta: ${JSON.stringify(body)}`
                    })
                  })
                  .catch(function(err) {
                    fmt.log({
                      type: 'error',
                      msg: `Error saving Travolta token and/or room_name.`,
                      error: err
                    })
                  })

                } else { // if error registering with Travolta
                  // Set session information
                  req.session.spotifyId       = account.get('id');
                  req.session.smsNumber       = account.get('number');
                  req.session.display_number  = account.get('display_number');
                  req.session.display_name    = account.get('display_name');
                  req.session.save();

                  // Redirect to React auth route
                  res.redirect(config.url +
                    `/auth?id=${encodeURIComponent(account.get('id'))}` +
                    `&number=${encodeURIComponent(account.get('number'))}` +
                    `&name=${encodeURIComponent(account.get('display_name'))}` +
                    `&displayNumber=${encodeURIComponent(account.get('display_number'))}` +
                    `&roomName=${encodeURIComponent(account.get('travolta_room_name'))}` +
                    `&orgName=${encodeURIComponent(account.get('salesforce_org'))}`
                  )

                  fmt.log({
                    type: 'warning',
                    msg: `Registration with Travolta failed (${body.status}: ${body.error}). FB Messenger and Chatter track requests will not work.`
                  })
                }
              })
            })
            .catch(function(err) {
              fmt.error(err)
            })
        }
      })
    }
  }

  _getLogout(req, res) {
    db.Account.destroy({ truncate: true, cascade: true })
    .then(function(data) {
      fmt.log({
        type: 'info',
        msg: 'User logged out'
      })

      // Return 200
      res.json({})
    })
  }
}

module.exports = new AuthController()
