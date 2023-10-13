import User from "@pickems/core/database/user";
import { reply } from "@pickems/core/utils";

interface Event {
  appId: string;
  token: string;
}

interface user {
  user_id: string;
  user_name: string;
  score: number;
  ranking: string;
}

const createLB = (lb: user[]): string => {
  return lb
    .map((user) => {
      const cr = parseInt(user.ranking).toString();
      return `${cr}. ${user.user_name} with ${user.score} points`;
    })
    .join("\n");
};

export const main = async (event: Event) => {
  try {
    const { data: lb } = await User.getTopUsers();
    if (!lb.length) {
      return reply({
        token: event.token,
        id: event.appId,
        title: "No user ranks found, try running '/update-ranking'",
      });
    }
    const lbs = createLB(lb as user[]);
    reply({
      token: event.token,
      id: event.appId,
      title: lbs,
    });
  } catch (error) {
    reply({
      token: event.token,
      id: event.appId,
      title: "Error try again..",
    });
  }
};
