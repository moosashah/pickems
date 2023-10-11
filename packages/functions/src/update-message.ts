import fetch from "node-fetch";
import { Config } from "sst/node/config";

interface FuncBody {
  token: string;
  app_id: string;
  message: string;
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

export const main = async (event: FuncBody) => {
  return await reply(event.message, event.app_id, event.token);
};
