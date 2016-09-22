
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
    // check for valid auth header
    const authHeaderValue = req.get('Authorization')
    return db.Account.findOne({ })
    .then(function(acct) {
      let msg = 'No active Travolta registration found.'
      fmt.log({
        type: 'error',
        msg: msg
      })
      
      if (!acct) {
        res.status(404).json({ error: msg })
        return
      }

      const isValid = (`Bearer ${acct.get('travolta_token')}` === authHeaderValue)
      if (!isValid) {
        let msg = `Received invalid or missing auth token in Travolta request Authorization header: ${authHeaderValue}`
        fmt.log({
          type: 'error',
          msg: msg
        })
        res.status(403).json({ error: msg })
        return

      } else {

        const track = {
          type: 'fb',
          sender: req.body.sender,
          text: req.body.text,
          rawMessage: req.body
        }

        let job = q.create('track', track)

        const ATTEMPTS = 3
        job.attempts(ATTEMPTS).ttl(5000)

        job.on('failed attempt', function(err, doneAttempts){
          console.log(`Worker failed to complete job, this is attempt ${doneAttempts} of ${ATTEMPTS}. Trying again.`)
        })

        job.on('failed', function(err) {
          console.log(`Worker failed to complete job after ${ATTEMPTS} attempts,`,err)
        })

        job.save(function(err) {
          if (!err) {
            fmt.log({
              type: 'info',
              msg: `Track request received, added to Redis queue`
            })
          }

          res.status(200).json({  })
        })
      }
    })
  }
}

module.exports = new TravoltaController()
