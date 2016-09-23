
'use strict'

let config = require('../config')
let oauth2 = require('simple-oauth2')(config.spotify)
let fmt = require('logfmt')

function getValidToken(acct) {

  let oldToken = acct.get('oauth_token')

  // save original expires_at date b/c the wrapper stomps on it
  let origExpiresAt = new Date(oldToken.expires_at)

  // Create the access token wrapper
  const token = oauth2.accessToken.create(oldToken)

  // set wrapper to proper expires_at date
  token.token.expires_at = origExpiresAt.toISOString()


  // Check if the token is expired. If expired it is refreshed.
  if (token.expired()) {
    fmt.log({
      type: 'info',
      msg: 'Token expired. Refreshing.'
    })

    return token.refresh()
      .then((result) => {
        return acct.update({
          oauth_token: result.token
        })
        .then(() => {
          return result.token.access_token
        })
        .catch((err) => {
          fmt.log({ type: 'error', msg: err })
          throw err
        })
      })
      .catch((err) => {
        fmt.log({ type: 'error', msg: err })
        throw err
      })
  } else {
    // Token valid. Don't refresh.
    return Promise.resolve(token.token.access_token)
  }
}

module.exports = getValidToken
