const https = require("https");
const url = require("url");

exports.handler = function(event, context) {
  console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));
  sendResponse(event, context);
}

function sendResponse(event, context) {

      var responseBody = JSON.stringify({
        channel: process.env.slackchannel,
        text: ":fire_engine:" + event["detail-type"] + ":fire_engine:",
        attachments: [{
          author_name: "AWS-GuardDuty",
          color: "danger",
          fields: [{
            title: 'AccountId',
            value: event.detail.accountId,
            short: false,
          }, {
            title: 'Title',
            value: event.detail.title,
            short: false,
          }, {
            title: 'type',
            value: event.detail.type,
            short: true,
          }, {
            title: 'resourceType',
            value: event.detail.resource.resourceType,
            short: true,
          }],
        }]
      });

  var parsedUrl = url.parse(process.env.slackurl);
  var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(responseBody),
      }
  };

  console.log("SENDING RESPONSE...\n");

  var request = https.request(options, function(response) {
    console.log("STATUS: " + response.statusCode);
    console.log("HEADERS: " + JSON.stringify(response.headers));
    context.done();
});

  request.on("error", function(error) {
      console.log("sendResponse Error:" + error);
      context.done();
  });

  request.write(responseBody);
  request.end();
} 