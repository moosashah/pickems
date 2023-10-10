import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { InteractionType } from "discord-interactions";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
const sqs = new AWS.SQS();

interface Item {
  id: string;
  token: string;
  userId: string;
  pick: "red_id" | "blue_id";
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

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body!);
  const { type, data } = body;
  // const sig =
  //   event.headers["x-signature-ed25519"] ||
  //   event.headers["X-Signature-Ed25519"];
  // const ts =
  //   event.headers["x-signature-timestamp"] ||
  //   event.headers["X-Signature-Timestamp"];
  // if (!sig || !ts || !event.body) {
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify("invalid request signature"),
  //   };
  // }
  //
  // const isVerified = nacl.sign.detached.verify(
  //   Buffer.from(ts + event.body),
  //   Buffer.from(sig, "hex"),
  //   Buffer.from(Config.PUBLIC_KEY, "hex")
  // );
  //
  // if (!isVerified) {
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify("invalid request signature"),
  //   };
  // }
  //
  // if (type == InteractionType.PING) {
  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({ type: InteractionResponseType.PONG }),
  //   };
  // }
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
  // const interactor = {
  //   id: body.member.user.id,
  //   name: body.member.user.global_name,
  //   pick: data.custom_id,
  //   token: body.token,
  // };
  // console.log({ interactor });
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const postData = {
      id: body.application_id,
      token: body.token,
      userId: body.member.user.id,
      pick: data.custom_id,
    };

    try {
      await sendToSQS(postData);
      console.log("all good");
      return JSON.stringify({
        type: 5,
        data: { flags: 64 },
      });
    } catch (e) {
      console.error("error sending to queue records: ", e);
      throw e;
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: true }),
  };
};
