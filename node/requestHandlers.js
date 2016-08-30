var querystring = require("querystring"),
  fs = require("fs"),
  formidable = require("formidable")
  util = require("util");

function start(response) {
  console.log("Request handler 'start' was called.");

  var body = "Hello, Node server has started."
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(body);
  response.end();
}

function upload(response, request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  console.log("about to parse");
  form.parse(request, function (error, fields, files) {
    console.log("parsing done");
    fs.renameSync(files.upload.path, "C:\\test.gif");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write("received image:<br/>");
    response.write("<img src='/show'><br/>");
    response.write("received text:<br/>");
    response.write(fields.text);
    response.end();
  });


}

function show(response) {
  console.log("Request handler 'show' was called");

  fs.readFile("C:\\test.gif", "binary", function (error, file) {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, { "Content-Type": "image/gif" });
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start;
exports.upload = upload;
exports.show = show;