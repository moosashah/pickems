// import nacl from "tweetnacl";
// import { Config } from "sst/node/config";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { InteractionResponseType, InteractionType } from "discord-interactions";

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.body) {
    const { type } = JSON.parse(event.body);
    if (type === InteractionType.PING) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionResponseType.PONG,
        }),
      };
    }
  }
  return {
    statusCode: 404,
    body: JSON.stringify({ error: true }),
  };
};
