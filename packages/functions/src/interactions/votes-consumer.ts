import { Function } from "sst/node/function";
import { SQSEvent } from "aws-lambda";
import { Vote } from "@pickems/core/database/vote";
import AWS from "aws-sdk";
const lambda = new AWS.Lambda();

interface Item {
  appId: string;
  token: string;
  userId: string;
  pick: "red_id" | "blue_id";
  gameId: string;
}

export const main = async (event: SQSEvent) => {
  const data = event.Records.map((r) => {
    const body: Item = JSON.parse(r.body);
    return {
      user_id: body.userId,
      game_id: body.gameId,
      pick_id: body.pick,
      app_id: body.appId,
      token: body.token,
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

  try {
    await Vote.batchWrite(uniqueData);
    console.log(`Saved ${uniqueData.length} recorded to db`);
    uniqueData.forEach(async (r) => {
      const payload = {
        token: r.token,
        app_id: r.app_id,
        message: `You voted for ${r.pick_id}`,
      };
      return await lambda
        .invoke({
          FunctionName: Function.UpdateMessage.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(payload),
        })
        .promise();
    });
  } catch (e) {
    console.error({ e });
    throw e;
  }
};
