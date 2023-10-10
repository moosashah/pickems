import { Table } from "sst/node/table";
import AWS from "aws-sdk";
import fetch from "node-fetch";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getUserPoints = async (tableName: string, id: string) => {
  const res = await dynamoDb
    .get({
      TableName: tableName,
      Key: {
        id,
      },
    })
    .promise();

  return res.Item;
};

interface funcBody {
  userId: string;
  token: string;
  id: string;
}

const reply = async (content: string, id: string, token: string) => {
  const url = `https://discord.com/api/v10/webhooks/${id}/${token}/messages/@original`;

  const params = {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      Authorization:
        "Bot MTE1OTQwOTg3Njc4NzgwMjIzMw.Gpk4FZ.7MgX8NveKybGzpyFZpliLC732o9VpH6O4yFLW0",
    },
    body: JSON.stringify({
      type: 4,
      content,
    }),
  };
  try {
    return await (await fetch(url, params)).json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const main = async (event: funcBody) => {
  const points = await getUserPoints(Table.Users.tableName, event.userId);

  if (!points) {
    return await reply("You have no points", event.id, event.token);
  } else {
    return await reply(
      `You have ${points.score} points`,
      event.id,
      event.token
    );
  }
};
