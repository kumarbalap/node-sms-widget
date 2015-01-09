var config = require('config'),
   restify = require('restify'),
        fs = require('fs');

/* Controller scripts load */
var controllers = {}
    , controllers_path = process.cwd() + '/app/controllers'
fs.readdirSync(controllers_path).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        controllers[file.split('.')[0]] = require(controllers_path + '/' + file)
    }
});

/* Server settings */
var server = restify.createServer();
server.pre(restify.pre.sanitizePath());

server
    .use(restify.fullResponse())
    .use(restify.bodyParser())
    .use(restify.queryParser())

/* URL Mapping */
server.post("/send-message", controllers.smsWidget.sendMessage);
//server.get("/get-message/:id", controllers.smsWidget.getMessage);
server.get("/get-sent-messages", controllers.smsWidget.getSentMessages);

/* Server start */
var serverPort = 8888; // default
if (config.server && config.server.port) {
    serverPort = config.server.port;
}
server.listen(serverPort, function (err) {
    if (err) {
        console.error(err)
    } else {
        console.log('App is ready at : ' + serverPort)
    }
});

