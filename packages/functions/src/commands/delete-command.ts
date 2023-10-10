import { Handler } from "aws-lambda";
import { request } from "https";
import { Config } from "sst/node/config";

interface DeleteCommandEvent {
  cmd_id: string;
}

export const handler: Handler<DeleteCommandEvent> = async (event) => {
  const url = (app_id: string, guild_id: string, cmd_id: string) =>
    `https://discord.com/api/v10/applications/${app_id}/guilds/${guild_id}/commands/${cmd_id}`;

  const headers = {
    Authorization: `Bot ${Config.DISCORD_KEY}`,
    "Content-Type": "application/json",
  };

  const options = {
    method: "DELETE",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const req = request(
      url(Config.APPLICATION_ID, Config.GUILD_ID, event.cmd_id),
      options,
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        });
      }
    );

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};
