var http = require("http");
var url = require("url");
var path = require("path");
var fs = require('fs');

function start(route, handle) {
  function onRequest(request, response) {
    // var postData = "";
    // var pathname = url.parse(request.url).pathname;
    // console.log("Request for " + pathname + " received.");

    // request.setEncoding("utf8");

    // request.addListener("data", function(postDataChunk) {
    //   postData += postDataChunk;
    //   console.log("Received POST data chunk '"+
    //   postDataChunk + "'.");
    // });

    // request.addListener("end", function() {
    //   route(handle, pathname, response, postData);
    // });

    
    var filePath = '.' + request.url;
    if (filePath == './')
      filePath = './index.html';

    var extname = String(path.extname(filePath)).toLowerCase();
    var contentType = 'text/html';
    var mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'applilcation/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.svg': 'application/image/svg+xml'
    };

    contentType = mimeTypes[extname] || 'application/octect-stream';

    fs.readFile(filePath, function (error, content) {
      if (error) {
        if (error.code == 'ENOENT') {
          fs.readFile('./404.html', function (error, content) {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
          });
        }
        else {
          response.writeHead(500);
          response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
          response.end();
        }
      }
      else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
      }
    });
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;