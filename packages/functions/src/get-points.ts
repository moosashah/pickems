import User from "@pickems/core/database/user";
import { reply } from "@pickems/core/utils";

const getUserPoints = async (id: string) => {
  return (await User.get({ user_id: id })).data[0];
};

interface funcBody {
  userId: string;
  token: string;
  appId: string;
}

export const main = async (event: funcBody) => {
  const points = await getUserPoints(event.userId);

  if (!points) {
    return await reply("You have no points", event.appId, event.token);
  } else {
    let str: string;
    if (!points.ranking) {
      str = `You have ${points.score} points, error getting rank`;
    } else {
      str = `You are rank: ${parseInt(points.ranking).toString()} with ${
        points.score
      } ${(points.score as number) > 1 ? "points" : "point"}`;
    }

    return await reply(str, event.appId, event.token);
  }
};
