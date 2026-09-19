function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Determine how payload is passed. Could be in postData or parameter.
    let payloadStr = "";
    if (e.postData && e.postData.contents) {
      payloadStr = e.postData.contents;
    } else if (e.parameter && e.parameter.payload) {
      payloadStr = e.parameter.payload;
    }

    if (!payloadStr) {
      return jsonResponse({ success: false, message: "No payload received" });
    }

    const request = JSON.parse(payloadStr);
    const module = request.module;
    const action = request.action;
    const data = request.data;
    const id = request.id;

    if (!module || !action) {
      return jsonResponse({ success: false, message: "Missing module or action" });
    }

    let result;

    switch (module) {
      case 'products':
        result = routeProducts(action, data, id);
        break;
      case 'orders':
        result = routeOrders(action, data, id);
        break;
      case 'leads':
        result = routeLeads(action, data, id);
        break;
      case 'users':
        result = routeUsers(action, data, id);
        break;
      case 'services':
        result = routeServices(action, data, id);
        break;
      case 'documents':
        result = routeDocuments(action, data, id);
        break;
      default:
        return jsonResponse({ success: false, message: "Unknown module: " + module });
    }

    return jsonResponse(result);

  } catch (error) {
    return jsonResponse({ success: false, message: "Server error: " + error.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleOptions(e) {
  // Respond to preflight request (OPTIONS)
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON);
}
