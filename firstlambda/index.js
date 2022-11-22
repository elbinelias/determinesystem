const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
console.log('Loading function');

exports.handler = function(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));
    event.Records.forEach(function(record) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
        
        var search_param = record.dynamodb.Keys.userId.S;
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
		   else console.log(data);
		});
	    
        
        
    });
    callback(null, "message");
};