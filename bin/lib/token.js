let config = require('../config')
let oauth2 = require('simple-oauth2')(config.spotify)
let fmt = require('logfmt')

function getValidToken(oldToken) {

  // Create the access token wrapper
  const token = oauth2.accessToken.create(oldToken)

  // Check if the token is expired. If expired it is refreshed.
  if (token.expired()) {
    fmt.log({
      type: 'info',
      msg: 'Token expired. Refreshing.'
    })

    return token.refresh()
      .then((result) => {
        const newToken = oauth2.accessToken.create(result)
        return acct.update({
          oauth_token: result
        })
        .then(() => {
          return oauth2.accessToken.create(result).token.access_token
        })
      })
  } else {
    // Token valid. Don't refresh.
    return Promise.resolve(token.token.access_token)
  }
}

module.exports = getValidToken
