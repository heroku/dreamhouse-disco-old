
'use strict'

let express = require('express')
let db = require('../models')
let _ = require('lodash')
let twilio = require('twilio')
let q = require('../lib/queue')
let fmt = require('logfmt')
let Casey = require('../lib/casey')
let config = require('../config')

class SmsController {

  constructor() {
    this.root = '/sms'
    this.router = express.Router()
  }

  routes() {
    this.router.post('/', this._post.bind(this))

    return this.router
  }

  _post(req, res) {
    db.Account.findOne({ })
    .then(function(acct) {
      if (!acct) {
        let err = new Error(`No account found, have you auth'd with Spotify?`)
        fmt.log({ type: 'warning', msg: err })
        done(err)
        pauseWorker(ctx)
        return
      }

      const request = {
        type: 'sms',
        sender: `${req.body.From} (${req.body.FromCity})`,
        text: req.body.Body,
        rawMessage: req.body
      }

      // get shortcode from Casey
      // Casey returns undefined for the shortCode if a URL for him is not in the config
      Casey.createShortCodeFor(request)
      .then(function(shortCode) {
        console.log('GOT SHORTCODE',shortCode)
        if (shortCode) request.shortCode = shortCode

        let job = q.create('track', request)

        const ATTEMPTS = 3
        job.attempts(ATTEMPTS).ttl(5000)

        job.on('failed attempt', function(err, doneAttempts){
          console.log(`Track worker failed to complete job, this is attempt ${doneAttempts} of ${ATTEMPTS}. Trying again.`)
        })

        job.on('failed', function(err) {
          console.log(`Track worker failed to complete job after ${ATTEMPTS} attempts,`,err)
        })

        job.save(function(err) {
          if (!err) {
            fmt.log({
              type: 'info',
              msg: `Track request received, added to Redis queue`
            })
          }

          var resp = new twilio.TwimlResponse()

          // TODO: Add unique short url to SMS reply linking to landing page showing
          // personalized playlist of recommended tracks + Heroku call-to-actions.
          //
          // Landing page should show spinner and explanation text until page is ready.
          // Re-fetch data every 5 seconds.  Data may take time to generate as an
          // additional request to Spotify recommendation endpoint needs to be completed.
          res.writeHead(200, { 'Content-Type':'text/xml' })
          res.end(resp.sms(
            `Yum, a new track. We\'ll find it and add it to the playlist. ` +
            `Thanks, and keep the suggestions coming!` +
            `${config.caseyUrl}/p/${shortCode}`
          ).toString())
        })
      })
    })
  }
}

module.exports = new SmsController()
