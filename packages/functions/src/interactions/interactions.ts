import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { Function } from "sst/node/function";
import { Config } from "sst/node/config";
import nacl from "tweetnacl";
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

interface Item {
  appId: string;
  token: string;
  userId: string;
  pick: "red_id" | "blue_id";
  gameId: string;
}

const sendToSQS = async (item: Item) => {
  const params: AWS.SQS.SendMessageRequest = {
    QueueUrl: Queue.VotesQueue.queueUrl,
    MessageBody: JSON.stringify(item),
  };

  try {
    await sqs.sendMessage(params).promise();
  } catch (e) {
    console.error("error sending batch to votesQueue: ", e);
    throw e;
  }
};

const authenticate = (event: any): Boolean => {
  const sig =
    event.headers["x-signature-ed25519"] ||
    event.headers["X-Signature-Ed25519"];
  const ts =
    event.headers["x-signature-timestamp"] ||
    event.headers["X-Signature-Timestamp"];
  if (!sig || !ts || !event.body) {
    return false;
  }

  return nacl.sign.detached.verify(
    Buffer.from(ts + event.body),
    Buffer.from(sig, "hex"),
    Buffer.from(Config.PUBLIC_KEY, "hex")
  );
};

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body!);
  const { type, data } = body;
  const isVerified = authenticate(event);

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }

  if (type === InteractionType.PING) {
    return {
      statusCode: 200,
      body: JSON.stringify({ type: InteractionResponseType.PONG }),
    };
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    if (data.name === "ping") {
      const res = {
        type: 4,
        data: {
          content: "Pong!",
        },
      };
      return JSON.stringify(res);
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const postData: Item = {
      appId: body.application_id,
      token: body.token,
      userId: body.member.user.id,
      pick: data.custom_id,
      gameId: "red-vs-blue",
    };
    if (data.custom_id === "red_id" || data.custom_id === "blue_id") {
      try {
        sendToSQS(postData);
      } catch (e) {
        console.error("error sending to queue records: ", e);
        throw e;
      }
    }
    if (data.custom_id === "point_check") {
      lambda
        .invoke({
          FunctionName: Function.GetPointsFunction.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(postData),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Getting your points...", flags: 64 },
      });
    }

    return JSON.stringify({
      type: 5,
      data: { flags: 64 },
    });
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: true }),
  };
};
