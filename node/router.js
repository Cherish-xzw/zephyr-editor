var static = require("./static");

function route(handle, pathname, response, request) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    console.log("Handle static request for " + pathname);
    static.handleStaticRequest(request, response);
  }
}

exports.route = route;