import { SQSEvent } from "aws-lambda";
import { Table } from "sst/node/table";
import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

interface UsersRes {
  id: string;
  score: number;
}

const getUsersPoints = async (tableName: string, keys: { id: string }[]) => {
  const res = await dynamoDb
    .batchGet({
      RequestItems: {
        [tableName]: {
          Keys: keys,
        },
      },
    })
    .promise();

  return res.Responses?.[tableName] || [];
};

const batchCreateUsers = async (records: any[], tableName: string) => {
  return await dynamoDb
    .batchWrite({
      RequestItems: {
        [tableName]: records.map((rec) => {
          const parsedBody = JSON.parse(rec.body);
          return {
            PutRequest: {
              Item: {
                id: parsedBody.id,
                score: 1,
              },
            },
          };
        }),
      },
    })
    .promise();
};

const batchUpdatePoints = async (
  batchGetRes: UsersRes[],
  tableName: string
) => {
  const batchWriteParams = {
    RequestItems: {
      [tableName]: batchGetRes.map((rec) => {
        return {
          PutRequest: {
            Item: {
              id: rec.id,
              score: rec.score + 1,
            },
          },
        };
      }),
    },
  };

  return await dynamoDb.batchWrite(batchWriteParams).promise();
};
export const main = async (event: SQSEvent) => {
  const records: any[] = event.Records;
  const keys = records.map((r) => {
    const parsedId = JSON.parse(r.body).id;
    return {
      id: parsedId,
    };
  });

  const tbl = Table.Users.tableName;

  try {
    const batchGetRes = (await getUsersPoints(tbl, keys)) as UsersRes[] | [];

    if (!batchGetRes.length) {
      await batchCreateUsers(records, tbl);
      console.log(`Added ${keys.length} new users to database`);
      return {
        status: 200,
        message: `Added ${keys.length} new users to database`,
      };
    } else {
      await batchUpdatePoints(batchGetRes, tbl);
      console.log(`Updated scores for ${batchGetRes.length} people`);
      return {
        status: 200,
        message: `Updated scores for ${batchGetRes.length} people`,
      };
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
