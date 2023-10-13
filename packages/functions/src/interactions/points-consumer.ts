import { SQSEvent } from "aws-lambda";
import User from "@pickems/core/database/user";

interface UsersRes {
  user_id: string;
  user_name: string;
  score?: number;
}

interface Key {
  user_id: string;
  user_name: string;
}

const getUsersPoints = async (keys: Key[]) => {
  const r = await User.batchGet(keys);
  return r.data;
};

const batchUpdatePoints = async (records: UsersRes[]) => {
  const keys = records.map((r) => ({
    user_id: r.user_id,
    user_name: r.user_name,
    score: (r.score || 0) + 1,
  }));
  return await User.batchWrite(keys);
};

const batchCreateUsers = async (batchGetRes: Key[]) => {
  const batchWriteRecords = batchGetRes.map((rec) => ({
    user_id: rec.user_id,
    user_name: rec.user_name,
    score: 1,
  }));
  return await User.batchWrite(batchWriteRecords);
};

export const main = async (event: SQSEvent) => {
  const records: any[] = event.Records;
  const keys = records.map((r) => {
    const body = JSON.parse(r.body);
    return {
      user_id: body.user_id,
      user_name: body.user_name,
    };
  });

  try {
    const batchGetRes = await getUsersPoints(keys);

    if (!batchGetRes.length) {
      await batchCreateUsers(keys);
      console.log(`Added ${keys.length} new users to database`);
      return {
        status: 200,
        message: `Added ${keys.length} new users to database`,
      };
    } else {
      await batchUpdatePoints(batchGetRes);
      console.log(`Updated scores for ${batchGetRes.length} people`);
      return {
        status: 200,
        message: `Updated scores for ${batchGetRes.length} people`,
      };
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
