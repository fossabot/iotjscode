var fs = require('fs');
var http = require('http');
var devices = require('./devices');
var utils = require('./utils');
var port = 8085;

var server = http.createServer(function(req, res) {
  var data = '', path = utils.filter(req);

  switch (path[0]) {
    case '/':
      utils.status(res, JSON.stringify(devices));
      break;

    case '/repl':
      utils.recvDelegator(req, function(body) {
        utils.status(res, data, 200);
        close_application(body);
      });
      break;

    default:
      utils.status(res, data, 404, req);
      break;
  }
}).listen(port);

function close_application(data) {
  fs.writeFileSync(devices.config.new_filepath, new Buffer(data));
  server.close();
  console.log('TERMINATED');
  process.exit(0);
}
