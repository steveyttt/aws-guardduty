var aws = require("aws-sdk");
var guardduty = new aws.GuardDuty();

exports.handler = (event, context, callback) => {

  guardduty.listDetectors(function(err, data) {
      if (err) 
        console.log(err, err.stack);
      else
        var detectorId = data.DetectorIds[0];
        console.log("##### detector ID is " + detectorId + "#####")
        createMember(detectorId, event, context)
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createMember(detectorId, event, context) {

  var accountMatrix = event.ResourceProperties.accounts
  var j = 0

  while (accountMatrix.length >= j){
    console.log("####Attempting to create member invite for account " + accountMatrix[j].accountid + "####")
    var params = {
      AccountDetails: [
        {
          AccountId: accountMatrix[j].accountid.toString(),
          Email: accountMatrix[j].Email.toString()
        }, 
      ],
      DetectorId: detectorId
    }; 

      guardduty.createMembers(params, function(err, data) {
        if (err) 
          console.log(err, err.stack);
        else
          console.log(data);
       });

       j++

       if (j == accountMatrix.length) {
        await sleep(2000);
        inviteMembers(detectorId, event, context)
        break;
      }
    }
}

async function inviteMembers(detectorId, event, context){

  var accountMatrix = event.ResourceProperties.accounts
  var j = 0

  while (accountMatrix.length >= j){
    console.log("####Attempting to send member invite for account " + accountMatrix[j].accountid + "####")

    var params = {
        AccountIds: [
          accountMatrix[j].accountid.toString(),,
          ],
        DetectorId: detectorId,
        DisableEmailNotification: true
        };

          guardduty.inviteMembers(params, function(err, data) {
            if (err) 
              console.log(err, err.stack);
            else
              console.log(data);
          });

          j++

          if (j == accountMatrix.length) {
            await sleep(2000);
            sendResponse(event, context)
            break;
      }
  }
}

function sendResponse(event, context) {

  var responseBody = JSON.stringify({
      Status: "SUCCESS",
      Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
      PhysicalResourceId: context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: {}
  });

  var https = require("https");
  var url = require("url");

  var parsedUrl = url.parse(event.ResponseURL);
  var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: "PUT",
      headers: {
          "content-type": "",
          "content-length": responseBody.length
      }
  };

  console.log("#####SENDING RESPONSE...\n######");

  var request = https.request(options, function(response) {
      console.log("#####STATUS: " + response.statusCode + "#####");
      console.log("#####HEADERS: " + JSON.stringify(response.headers + "#####"));
      context.done();
  });

  request.on("error", function(error) {
      console.log("sendResponse Error:" + error);
      context.done();
  });

  request.write(responseBody);
  request.end();
}