var static = require("./static");

function route(handle, pathname, response, postData, filePath) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, postData);
  } else {
    console.log("Handle static request for " + filePath);
    static.handleStaticRequest(filePath, response);
  }
}

exports.route = route;