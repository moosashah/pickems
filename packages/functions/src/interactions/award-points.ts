import { Queue } from "sst/node/queue";
import AWS from "aws-sdk";
import { Vote } from "@pickems/core/database/vote";
import { APIGatewayEvent } from "aws-lambda";
const sqs = new AWS.SQS();

const sendToSQS = async (
  items: {
    user_id: string;
    game_id: string;
    pick_id: string;
  }[]
) => {
  const entries = items.map((item, index) => {
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
    await sqs.sendMessageBatch(params).promise();
  } catch (e) {
    console.error("error sending batch to SQS: ", e);
    throw e;
  }
};

export const main = async (event: APIGatewayEvent) => {
  const { pick_id, game_id } = JSON.parse(event.body!);
  try {
    const res = await Vote.getByPick({ pick_id, game_id });

    if (res.data.length) {
      for (let i = 0; i < res.data.length; i += 10) {
        const batch = res.data.slice(i, i + 10);
        sendToSQS(batch);
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
