import { Queue } from "sst/node/queue";
import AWS from "aws-sdk";
import Vote from "@pickems/core/database/vote";
import Game from "@pickems/core/database/game";
import { pullTeamName, reply } from "@pickems/core/utils";
const sqs = new AWS.SQS();

const togglePointsAwarded = async (
  votes: {
    user_id: string;
    game_id: string;
    pick_id: string;
    user_name: string;
  }[]
) => {
  const updatedVotes = votes.map((vote) => ({ ...vote, points_awarded: true }));
  return await Vote.batchWrite(updatedVotes);
};

const sendToPointsQueue = async (
  votes: {
    user_id: string;
    user_name: string;
    game_id: string;
    pick_id: string;
  }[]
) => {
  const entries = votes.map((item, index) => {
    const i = {
      Id: index.toString(),
      MessageBody: JSON.stringify(item),
      MessageGroupId: `${item.user_id}${item.game_id}`,
      MessageDeduplicationId: `${item.user_id}${item.game_id}`,
    };
    return i;
  });

  const params: AWS.SQS.SendMessageBatchRequest = {
    QueueUrl: Queue.PointsQueue.queueUrl,
    Entries: entries,
  };

  try {
    await Promise.all([
      await sqs.sendMessageBatch(params).promise(),
      await togglePointsAwarded(votes),
    ]);
  } catch (e) {
    console.error("error sending batch to SQS: ", e);
    throw e;
  }
};

interface FuncBody {
  gameId: string;
  pickId: "red_side" | "blue_side";
  appId: string;
  token: string;
}

export const main = async (event: FuncBody) => {
  try {
    const res = await Vote.getByPick({
      pick_id: event.pickId,
      game_id: event.gameId,
      points_awarded: false,
    });

    const g = await Game.pointsAwarded(event.gameId);
    if (g === "no game found") {
      console.log({ res });
      return await reply({
        title: `Points already rewarded for this game`,
        token: event.token,
        id: event.appId,
      });
    }
    const teamName = pullTeamName(event.pickId, g.data);

    if (res.data.length) {
      for (let i = 0; i < res.data.length; i += 10) {
        const batch = res.data.slice(i, i + 10);
        sendToPointsQueue(batch);
      }

      return await reply({
        token: event.token,
        id: event.appId,
        title: `Awarding ${res.data.length} people...  Winner: ${teamName}`,
      });
    }

    return await reply({
      title: `No votes found for ${teamName}`,
      token: event.token,
      id: event.appId,
    });
  } catch (e) {
    console.error("error fetching records: ", e);
    await reply({
      title: `Error fetching winners: ${e}`,
      token: event.token,
      id: event.appId,
    });
    throw e;
  }
};
