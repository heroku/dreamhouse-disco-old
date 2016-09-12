
'use strict'

var fmt = require('logfmt')
var express = require('express')
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
var path = require('path')
var bodyParser = require('body-parser')
var kue = require('kue')
var _ = require('lodash')
var controllers = require('./controllers')
var config = require('./config')
var db = require('./models')

var app = express()

db.init().catch(function(err) {
  fmt.log({
    type: 'error',
    msg: 'Could not connect to PG database, have you created the add-on?'
  })

  process.exit(0)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', express.static(path.resolve(__dirname, '..', 'build')))

// Setup redis as the session store
app.use(session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
    pass: config.redis.auth,
    logErrors: true
  }),
  secret: config.secret,
  saveUninitialized: true,
  resave: true
}))

_.each(controllers, function(controller) {
  app.use('/api' + controller.root, controller.routes())
})

if (config.env === 'development') {
  kue.app.listen(5555)

  fmt.log({
    type: 'info',
    msg: 'Dev env detected, Kue running on port: 5555'
  })
}

app.listen(config.server.port)

fmt.log({
  type: 'info',
  msg: `Express API running on port: ${config.server.port}`
})
