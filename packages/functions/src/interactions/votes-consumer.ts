import { Function } from "sst/node/function";
import { SQSEvent } from "aws-lambda";
import Vote from "@pickems/core/database/vote";
import Game from "@pickems/core/database/game";
import AWS from "aws-sdk";
import { Item, TeamKey, teams } from "@pickems/core/types";
const lambda = new AWS.Lambda();

export const main = async (event: SQSEvent) => {
  const data = event.Records.map((r) => {
    const body: Item = JSON.parse(r.body);
    if (!body.gameId) {
      throw new Error("No game id");
    }
    return {
      user_id: body.userId,
      game_id: body.gameId,
      pick_id: body.pickId,
      app_id: body.appId,
      token: body.token,
      user_name: body.userName,
    };
  });

  const uniqueData = data.filter(({ user_id }) => {
    const seen = new Set();
    if (seen.has(user_id)) {
      return false;
    }
    seen.add(user_id);
    return true;
  });

  const gameIds = uniqueData.map((r) => ({ game_id: r.game_id }));

  try {
    const [{ data }] = await Promise.all([
      Game.batchGet(gameIds),
      Vote.batchWrite(uniqueData),
    ]);
    //Need to join vote data into single object since indexes might not match up

    console.log(`Saved ${uniqueData.length} votes to db`);
    for (let i = 0; i < uniqueData.length; i++) {
      const sideSelection =
        data[i][uniqueData[i].pick_id as "red_side" | "blue_side"];
      const teamName = teams[sideSelection.team_name as TeamKey];

      const payload = {
        token: uniqueData[i].token,
        app_id: uniqueData[i].app_id,
        message: `You voted for ${teamName}`,
      };
      return await lambda
        .invoke({
          FunctionName: Function.UpdateMessage.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(payload),
        })
        .promise();
    }
  } catch (e) {
    console.error({ e });
    throw e;
  }
};
