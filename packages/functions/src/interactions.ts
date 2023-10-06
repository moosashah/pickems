import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import { Config } from "sst/node/config";
import nacl from "tweetnacl";

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const sig =
    event.headers["x-signature-ed25519"] ||
    event.headers["X-Signature-Ed25519"];
  const ts =
    event.headers["x-signature-timestamp"] ||
    event.headers["X-Signature-Timestamp"];
  if (!sig || !ts || !event.body) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }
  const body = JSON.parse(event.body);

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(ts + event.body),
    Buffer.from(sig, "hex"),
    Buffer.from(Config.PUBLIC_KEY, "hex")
  );

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }

  const { type, data } = body;
  if (type == InteractionType.PING) {
    return {
      statusCode: 200,
      body: JSON.stringify({ type: InteractionResponseType.PONG }),
    };
  }
  console.log("passed auth");
  console.log({ data });
  if (type === InteractionType.APPLICATION_COMMAND) {
    console.log("application command");
    if (data.name === "ping") {
      console.log("ping command");
      const res = {
        type: 4,
        data: {
          content: "Pong!",
        },
      };
      return JSON.stringify(res);
    }
    if (data.name === "foo") {
      console.log("foo command");
      const res = {
        type: 4,
        data: {
          content: "bar!",
        },
      };
      return JSON.stringify(res);
    }
  }
  return {
    statusCode: 404,
    body: JSON.stringify({ error: true }),
  };
};
