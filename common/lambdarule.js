var AWS = require('aws-sdk');
var iot = new AWS.Iot({endpoint: 'iot.us-west-2.amazonaws.com', region: 'us-west-2',
    accessKeyId: 'AKIAIOKZOEGS4OB3LORQ',
    secretAccessKey: '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'
});

exports.lambda = function (device_serial) {
    console.log(device_serial);
    var ruleName = 'halo_LambdaRule_' + device_serial;
    var topicName = 'halo/' + device_serial;
    var sqlQuery = "SELECT * FROM '" + topicName + "'";
    var params = {
        ruleName: ruleName,
        topicRulePayload: {
            actions: [
                {
                    lambda: {
                        functionArn: 'arn:aws:lambda:us-west-2:009517463730:function:testinput'
                    },
                },
            ],
            sql: sqlQuery,
            awsIotSqlVersion: '2016-03-23',
            description: 'LambdaRule',
            ruleDisabled: false
        }
    };
    iot.createTopicRule(params, function (err, data) {
        if (err)
            console.log(err, err.stack); // an error occurred
        else
            console.log(data);           // successful response
    });
}
