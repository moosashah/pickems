import { APIGatewayEvent } from "aws-lambda";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import AWS from "aws-sdk";
import { Function } from "sst/node/function";
import Game from "@pickems/core/database/game";
import { Item, ParsedBody } from "@pickems/core/types";
import {
  authenticate,
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
      lambda
        .invoke({
          FunctionName: Function.CreateGame.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(body),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Creating game..." },
      });
    }

    if (data.name === "close-voting") {
      const funcBody = {
        token: body.token,
        appId: body.application_id,
      };
      lambda
        .invoke({
          FunctionName: Function.CloseVoting.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(funcBody),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Getting games..." },
      });
    }

    if (data.name === "award-points") {
      const pl = await Game.getUnrewardedGames();
      if (!pl.data.length) {
        return JSON.stringify({
          type: 4,
          data: {
            content: "No Unrewarded games",
          },
        });
      }
      // const dropdown = createPointsSelectMenu({
      //   games: pl,
      //   title: "Select game to award points for",
      //   placeholder: "Games",
      //   customId: "award-points-selection",
      // });
      //
      // return JSON.stringify({
      //   type: 4,
      //   data: dropdown,
      // });
    }

    if (data.name === "leaderboard") {
      const funcBody = {
        token: body.token,
        appId: body.application_id,
      };
      lambda
        .invoke({
          FunctionName: Function.CreateLeaderboard.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(funcBody),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Getting top 10..." },
      });
    }

    if (data.name === "points") {
      lambda
        .invoke({
          FunctionName: Function.GetPointsFunction.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify({
            userId: body.member.user.id,
            token: body.token,
            appId: body.application_id,
          }),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Getting your points...", flags: 64 },
      });
    }

    if (data.name === "update-ranking") {
      const funcBody = {
        token: body.token,
        appId: body.application_id,
      };
      lambda
        .invoke({
          FunctionName: Function.UpdateRanking.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(funcBody),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Updating ranks....", flags: 64 },
      });
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    if ((data.custom_id as string).startsWith("$vote")) {
      const gameId = extractGameId(body.data.custom_id);
      const pickId = extractPickId(body.data.custom_id);
      const voteData: Item = {
        appId: body.application_id,
        token: body.token,
        userId: body.member.user.id,
        userName: body.member.user.global_name,
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

    if (data.custom_id === "close-voting-selection") {
      if (!data.values) {
        return JSON.stringify({
          type: 4,
          data: { content: "No game found...", flags: 64 },
        });
      }
      const funcBody = {
        token: body.token,
        appId: body.application_id,
        gameId: data.values[0],
      };
      lambda
        .invoke({
          FunctionName: Function.CloseVotingSelection.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(funcBody),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Closing game..." },
      });
    }

    if (data.custom_id === "award-points-selection") {
      // if (!data.values) {
      //   return JSON.stringify({
      //     type: 4,
      //     data: { content: "No game found...", flags: 64 },
      //   });
      // }
      //
      // const [gameId, pickId] = data.values[0].split("#");
      // const game = await Game.getGame(gameId);
      // lambda
      //   .invoke({
      //     FunctionName: Function.AwardPoints.functionName,
      //     InvocationType: "Event",
      //     Payload: JSON.stringify({ game_id: gameId, pick_id: pickId }),
      //   })
      //   .promise();
      // if (!game.data) {
      //   return JSON.stringify({
      //     type: 4,
      //     data: { content: "No game found...", flags: 64 },
      //   });
      // }
      //
      // const teamName =
      //   teams[
      //     game.data[pickId as "red_side" | "blue_side"].team_name as TeamKey
      //   ];
      // await Game.pointsAwarded(gameId);
      //
      // return JSON.stringify({
      //   type: 4,
      //   data: {
      //     content: `Awarding...  Winner: ${teamName}`,
      //   },
      // });
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
