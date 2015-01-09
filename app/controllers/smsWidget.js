

exports.sendMessage = function(req, res, next) {
   var client = require('../twilio/client');

   client.sms.messages.create({
       to: req.params.toMobile,
       from: req.params.fromMobile,
       body: req.params.smsTxt
   }, function(error, message) {
       if (!error) {
           console.log(message.sid);
           console.log(message.dateCreated);

           res.json({
              type: true,
              data: {
                 to: req.params.toMobile,
                 from: req.params.fromMobile,
                 smsTxt: message.body,
                 creationDate: message.dateCreated,
                 status: message.status                 
              }
          });
       } else {
           console.log('Oops! There was an error.');
           res.json({
              type: false,
              data: "Message not sent."
          });
       }
   });
}

// ToDo: Filter by Date and update to existing list
exports.getSentMessages = function(req, res, next) {
   var client = require('../twilio/client');

   client.messages.list(function(err, data) {
       if (!err) {
           var msgList = [];

           data.messages.forEach(function(message) {
              msgList.push( {
                 to: message.to,
                 from: message.from,
                 smsTxt: message.body,
                 creationDate: message.date_created,
                 status: message.status
              } );
           });

           res.json({
              type: true,
              data: msgList
          });
       } else {
           console.log('Oops! There was an error. => getMessageList');
           res.json({
              type: false,
              data: "Messages could not be retrieved."
          });
       }
   });

}
