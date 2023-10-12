import { Queue } from "sst/node/queue";
import AWS from "aws-sdk";
import Vote from "@pickems/core/database/vote";
import { APIGatewayEvent } from "aws-lambda";
const sqs = new AWS.SQS();

const togglePointsAwarded = async (
  votes: {
    user_id: string;
    game_id: string;
    pick_id: string;
  }[]
) => {
  const updatedVotes = votes.map((vote) => ({ ...vote, points_awarded: true }));
  return await Vote.batchWrite(updatedVotes);
};

const sendToPointsQueue = async (
  votes: {
    user_id: string;
    game_id: string;
    pick_id: string;
  }[]
) => {
  const entries = votes.map((item, index) => {
    const i = {
      Id: index.toString(),
      MessageBody: JSON.stringify(item),
      MessageGroupId: item.user_id,
      MessageDeduplicationId: item.user_id,
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
  game_id: string;
  pick_id: string;
}

export const main = async (event: FuncBody) => {
  const { pick_id, game_id } = event;
  try {
    const res = await Vote.getByPick({
      pick_id,
      game_id,
      points_awarded: false,
    });

    if (res.data.length) {
      for (let i = 0; i < res.data.length; i += 10) {
        const batch = res.data.slice(i, i + 10);
        sendToPointsQueue(batch);
      }
      return JSON.stringify({
        status: 200,
        message: `Awarding points to ${res.data?.length} people`,
      });
    }
    return JSON.stringify({
      status: 500,
      message: `Error fetching winners`,
    });
  } catch (e) {
    console.error("error fetching records: ", e);
    throw e;
  }
};
