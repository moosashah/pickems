import fetch from "node-fetch";
import { Config } from "sst/node/config";
import User from "@pickems/core/database/user";

const getUserPoints = async (id: string) => {
  return (await User.get({ user_id: id })).data[0];
};

interface funcBody {
  userId: string;
  token: string;
  appId: string;
}

const reply = async (content: string, id: string, token: string) => {
  const url = `https://discord.com/api/v10/webhooks/${id}/${token}/messages/@original`;

  const params = {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bot " + Config.BOT_TOKEN,
    },
    body: JSON.stringify({
      type: 4,
      content,
    }),
  };

  try {
    return await (await fetch(url, params)).json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const main = async (event: funcBody) => {
  const points = await getUserPoints(event.userId);

  if (!points) {
    return await reply("You have no points", event.appId, event.token);
  } else {
    return await reply(
      `You are rank: ${points.ranking} with ${points.score} points`,
      event.appId,
      event.token
    );
  }
};
