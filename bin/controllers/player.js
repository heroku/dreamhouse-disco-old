
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
var fmt = require('logfmt')
let request = require('request')


class PlayerController {

  constructor() {
    this.root = '/player'
    this.router = express.Router()
    this.db = db
  }

  routes() {
    this.router.post('/event', this._postPlayerEvent.bind(this))
    return this.router
  }

  _get(req, res) {
    res.send('hello world')
  }

  // Track a new Player Event
  _postPlayerEvent(req, res) {
    // request body will be { action, payload }
    // record player state
    const action  = req.body.action
    const payload = req.body.payload

    console.log(`----> Received request for action ${action} and payload ${payload}`)

    this.db.PlayerEvent.create({
      action,
      payload
    })
    .then(function(playerEvent) {
      fmt.log({
        type: 'info',
        msg: 'a player event has been recorded',
        action: playerEvent.action
      })
    })

    // return 200 json response
    res.json({})
  }
}

module.exports = new PlayerController()
