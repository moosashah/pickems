import { Table } from "sst/node/table";
import AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const main = async (event: SQSEvent) => {
  const data = event.Records.map((r) => JSON.parse(r.body));

  const seen = new Set();
  const uniqueData = data.filter(({ userId }) => {
    if (seen.has(userId)) {
      return false;
    }
    seen.add(userId);
    return true;
  });

  const writeReqs = uniqueData.map(({ userId, pick }) => ({
    PutRequest: {
      Item: {
        id: userId,
        pick,
      },
    },
  }));

  const params = {
    RequestItems: {
      [Table.Votes.tableName]: writeReqs,
    },
  };
  try {
    await dynamoDb.batchWrite(params).promise();
    console.log(`Saved ${data.length} recorded to db`);
    return {
      status: 200,
      message: `Saved ${data.length} recorded to db`,
    };
  } catch (e) {
    console.log({ e });
    throw e;
  }
};
