
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
var fmt = require('logfmt')
let request = require('request')

class SetupController {

  constructor() {
    this.root = '/setup'
    this.router = express.Router()
    this.db = db
  }

  routes() {
    this.router.get('/', this._getSetup.bind(this))
    this.router.patch('/', this._patchSetup.bind(this))

    return this.router
  }

  // Get existing setup values
  _getSetup(req, res) {
    db.Account.findOne({ })
    .then(function(acct) {
      res.json({
        number: acct.get('number'),
        salesforceUserName: acct.get('salesforce_user_name'),
        salesforceUserEmail: acct.get('salesforce_user_email'),
        displayNumber: acct.get('display_number'),
        playlistId: `spotify:user:${acct.get('id')}:playlist:${acct.get('playlist_id')}`,
        playlistPrependTextV1: `spotify:user:${acct.get('id')}:playlist:1WCoOeyBzRcWQfcFaJObFZ`,
        playlistPrependTextV2: `https://play.spotify.com/user/${acct.get('id')}/playlist/1WCoOeyBzRcWQfcFaJObFZ`
      })
    })
  }

  // Write setup values
  _patchSetup(req, res) {
    db.Account.findOne({ })
    .then(function(acct) {
      let updateKeys = _.map(_.keys(req.body), _.snakeCase)
      let update = _.zipObject(updateKeys, _.values(req.body))

      // standardize playlist_id value since multiple values are valid
      let playlist_id = update.playlist_id
      if (playlist_id) {
        if (playlist_id.match(/^https:/)) {
          playlist_id = _.last(playlist_id.split('/'))
        } else {
          playlist_id = _.last(playlist_id.split(':'))
        }
        update.playlist_id = playlist_id
      }

      acct.update(
        update,
        { fields: [ 'number', 'display_number', 'playlist_id' ] }
      )
      .then(function() {
        acct.reload().then(function() {
          fmt.log({
            type: 'info',
            msg: `Set number as ${acct.get('number')}, display_number as ${acct.get('display_number')}, and playlist_id as ${acct.get('playlist_id')}`
          })
          res.json({
            number: acct.get('number'),
            displayNumber: acct.get('display_number'),
            salesforceUserName: acct.get('salesforce_user_name'),
            salesforceUserEmail: acct.get('salesforce_user_email'),
            playlistId: `spotify:user:${acct.get('id')}:playlist:${acct.get('playlist_id')}`,
            playlistPrependTextV1: `spotify:user:${acct.get('id')}:playlist:${acct.get('playlist_id')}`,
            playlistPrependTextV2: `https://play.spotify.com/user/${acct.get('id')}/playlist/${acct.get('playlist_id')}`
          })
        })
      })
    })
  }
}

module.exports = new SetupController()
