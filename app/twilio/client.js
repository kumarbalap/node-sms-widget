var config = require('config');

var account = {
    'sid': config.twilioAccount.sid,
    'auth_token': config.twilioAccount.auth_token
}
module.exports = require('twilio')(account.sid, account.auth_token);