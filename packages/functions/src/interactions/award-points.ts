import { Table } from "sst/node/table";
import { Queue } from "sst/node/queue";
import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const sendToSQS = async (items) => {
  const entries = items.map((item, index) => {
    const i = {
      Id: index.toString(),
      MessageBody: JSON.stringify(item),
      MessageGroupId: item.id,
      MessageDeduplicationId: item.id,
    };
    return i;
  });
  const params: AWS.SQS.SendMessageBatchRequest = {
    QueueUrl: Queue.PointsQueue.queueUrl,
    Entries: entries,
  };

  try {
    await sqs.sendMessageBatch(params).promise();
  } catch (e) {
    console.error("error sending batch to SQS: ", e);
    throw e;
  }
};

export const main = async (event) => {
  const { pick_id } = JSON.parse(event.body!);

  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: Table.Votes.tableName,
    IndexName: "GSI1",
    KeyConditionExpression: "pick = :pick",
    ExpressionAttributeValues: {
      ":pick": pick_id,
    },
  };

  try {
    const res = await dynamoDb.query(params).promise();

    if (res.Items?.length) {
      for (let i = 0; i < res.Items.length; i += 10) {
        const batch = res.Items.slice(i, i + 10);
        sendToSQS(batch);
      }
      return JSON.stringify({
        status: 200,
        message: `Awarding points to ${res.Items?.length} people`,
      });
    }
    return JSON.stringify({
      status: 500,
      message: `Error fetching winners`,
    });
  } catch (e) {
    console.error("error fetching records: ", e);
    throw e;
  }
};
