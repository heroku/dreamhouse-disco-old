
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
let q = require('../lib/queue')
let fmt = require('logfmt')

class TravoltaController {

  constructor() {
    this.root = '/travolta'
    this.router = express.Router()
  }

  routes() {
    this.router.post('/', this._post.bind(this))

    return this.router
  }

  _post(req, res) {

    const track = {
      type: 'fb',
      sender: req.body.sender,
      text: req.body.text,
      spotifyAccountId: req.body.spotifyAccountId,
      rawMessage: req.body
    }

    let job = q.create('track', track)

    job.attempts(3).ttl(5000)

    job.on('failed attempt', function(err, doneAttempts){
      console.log(`Worker failed to complete job, this is attempt ${doneAttempts} of 3`)
    })

    job.on('failed', function(err) {
      console.log('Worker failed to complete job,',err)
    })

    job.save(function(err) {
      if (!err) {
        fmt.log({
          type: 'info',
          msg: `Track request received, added to Redis queue`
        })
      }

      res.writeHead(200, { 'Content-Type':'application/json' })
      res.end()
    })
  }
}

module.exports = new TravoltaController()
