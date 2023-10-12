import { APIGatewayEvent } from "aws-lambda";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import AWS from "aws-sdk";
import { Function } from "sst/node/function";
import Game from "@pickems/core/database/game";
import { CreateGame, Item, ParsedBody } from "@pickems/core/types";
import {
  authenticate,
  createGame,
  createVotingSelectMenu,
  extractGameId,
  extractPickId,
  sendToVotesQueue,
} from "@pickems/core/utils";
import nacl from "tweetnacl";
const lambda = new AWS.Lambda();

export const main = async (event: APIGatewayEvent) => {
  const body: ParsedBody = JSON.parse(event.body!);
  const { type, data } = body;
  const isVerified = authenticate(event, nacl);

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

    if (data.name === "create-game") {
      if (!data.options) {
        return JSON.stringify({ type: 4, content: "No options" });
      }
      const str = await createGame(body as CreateGame);
      console.log({ str });
      return JSON.stringify({ type: 4, data: str });
    }

    if (data.name === "close-voting") {
      const pl = await Game.getActiveGames();
      if (!pl.data.length) {
        return JSON.stringify({
          type: 4,
          data: {
            content: "No active games",
          },
        });
      }
      return JSON.stringify({
        type: 4,
        data: createVotingSelectMenu({
          games: pl,
          title: "Select game to close voting for.",
          placeholder: "Games",
          customId: "close-voting-selection",
        }),
      });
    }

      });
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    //need to figure out point check payload
    const postData: Item = {
      appId: body.application_id,
      token: body.token,
      userId: body.member.user.id,
      pickId: data.custom_id,
    };
    if ((data.custom_id as string).startsWith("$vote")) {
      const gameId = extractGameId(body.data.custom_id);
      const pickId = extractPickId(body.data.custom_id);
      const voteData: Item = {
        appId: body.application_id,
        token: body.token,
        userId: body.member.user.id,
        pickId,
        gameId,
      };
      try {
        sendToVotesQueue(voteData);
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

    if (data.custom_id === "close-voting-selection") {
      console.log("close voting select");
      console.log("close voting select");
      console.log("close voting select");
      console.log("close voting select");
      console.log("close voting select");
      console.log("close voting select");
      console.log({ body });
      console.log({ data });
      if (!data.values) {
        return JSON.stringify({
          type: 4,
          data: { content: "No game found...", flags: 64 },
        });
      }
      const del = await Game.closeVoting(data.values[0]);
      //TODO: Update drop down and remove game from options

      if (!del.data) {
        return JSON.stringify({
          type: 4,
          data: { content: "No game found...", flags: 64 },
        });
      }

      console.log({ del });

      return JSON.stringify({
        type: 4,
        data: {
          content: "Closed match",
          flags: 64,
        },
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
