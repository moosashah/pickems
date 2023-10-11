import { SQSEvent } from "aws-lambda";
import { Vote } from "@pickems/core/database/vote";

export const main = async (event: SQSEvent) => {
  const data = event.Records.map((r) => {
    const body = JSON.parse(r.body);
    return {
      userId: body.userId,
      gameId: "red-vs-blue",
      pickId: body.pick,
    };
  });

  const uniqueData = data.filter(({ userId }) => {
    const seen = new Set();
    if (seen.has(userId)) {
      return false;
    }
    seen.add(userId);
    return true;
  });

  console.log({ uniqueData });

  try {
    await Vote.batchWrite(uniqueData);
    console.log(`Saved ${uniqueData.length} recorded to db`);
    return {
      status: 200,
      message: `Saved ${data.length} recorded to db`,
    };
  } catch (e) {
    console.log({ e });
    throw e;
  }
};
