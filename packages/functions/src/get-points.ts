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
  const user = await getUserPoints(event.userId);

  if (!user) {
    return await reply({
      title: "You have no points",
      token: event.token,
      id: event.appId,
    });
  } else {
    let str: string;
    if (!user.ranking) {
      str = `You have ${user.score} points, error getting rank`;
    } else {
      str = `You are rank: ${parseInt(user.ranking).toString()} with ${
        user.score
      } ${(user.score as number) > 1 ? "points" : "point"}`;
    }

    return await reply({ title: str, id: event.appId, token: event.token });
  }
};
