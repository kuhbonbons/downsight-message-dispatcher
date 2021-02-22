const AWS = require('aws-sdk');

const SQS = new AWS.SQS();
const mysql = require('serverless-mysql')({
  config: {
    host: process.env.ENDPOINT,
    database: process.env.DATABASE,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
  },
});

const sendMessage = async (message) => {
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: process.env.QUEUEURL,
    MessageDeduplicationId: message.name + message.id,
    MessageGroupId: 'service-message',
  };

  await SQS.sendMessage(params).promise();
};

exports.handler = async () => {
  try {
    const results = await mysql.query('SELECT * FROM services');

    await Promise.all(results.map((service) => sendMessage(service)));

    await mysql.end();

    return results;
  } catch (error) {
    console.error(error);
    return null;
  }
};
