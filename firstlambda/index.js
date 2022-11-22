const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
console.log('Loading function');

async function getGCPdetails(search_param){
  // params to send to lambda
  const params = {
    FunctionName: 'GCPDynamoDBRecords',
    InvocationType: 'RequestResponse',
    LogType: 'None',
    Payload: JSON.stringify({"gcpid": search_param})
  };
  const response = await lambda.invoke(params).promise();
  if(response.StatusCode !== 200){
    throw new Error('Failed to get response from lambda function')
  }
  return JSON.parse(response.Payload);
}

exports.handler = function(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    var check = "no";
    event.Records.forEach(function(record) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
        
        if (record.eventName == "INSERT")
        {
          var search_param = record.dynamodb.NewImage.title.S;
          var search_param_len = search_param.length;
          console.log('Length is : %j', search_param_len.toString());
          
      		var params = {
      		TableName : 'rule-table-dev',
      		FilterExpression : 'userId = :search_param',
      		ExpressionAttributeValues : {':search_param' : search_param_len.toString()}
      		};
      		
      		var documentClient = new AWS.DynamoDB.DocumentClient();
      		
      		documentClient.scan(params, function(err, data) {
      		   if (err) console.log(err);
      		   else 
      		   {
      		       data.Items.forEach(function(element, index, array) {
                      console.log('system determined is %j',element.primary);
                      if (element.primary.toString() == "gcp"){
                        check = "yes";
                        const gcp = getGCPdetails(search_param);
                        }
                      });
      		   }
      		   console.log('value before %j',check);
      		});
      	  if (check.toString() == "yes"){
      		     // invoke and get info from `getGCPdetails`
      		     console.log('value %j',check)
                const gcp = getGCPdetails();
                console.log('GCP :%j', gcp);
      		   }  
              
        }    
      });
    callback(null, "message");
};
