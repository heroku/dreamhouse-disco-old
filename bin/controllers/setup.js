
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
        displayNumber: acct.get('display_number'),
        playlistId: acct.get('playlist_id'),
        playlistPrependText: `spotify:user:${acct.get('id')}:playlist:`
      })
    })
  }

  // Write setup values
  _patchSetup(req, res) {
    db.Account.findOne({ })
    .then(function(acct) {
      let updateKeys = _.map(_.keys(req.body), _.snakeCase)
      let update = _.zipObject(updateKeys, _.values(req.body))
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
            playlistId: acct.get('playlist_id'),
            playlistPrependText: `spotify:user:${acct.get('id')}:playlist:`
          })
        })
      })
    })
  }
}

module.exports = new SetupController()
