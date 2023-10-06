import { Handler } from "aws-lambda";
import { request } from "https";
import { Config } from "sst/node/config";

interface RegisterCommandEvent {
  payload: {
    name: string;
    description?: string;
    type: number;
  };
}

export const handler: Handler<RegisterCommandEvent> = async (event) => {
  const url = (app_id: string, guild_id: string) =>
    `https://discord.com/api/v10/applications/${app_id}/guilds/${guild_id}/commands`;

  const payload = event.payload;

  const headers = {
    Authorization: `Bot ${Config.DISCORD_KEY}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.from(JSON.stringify(payload)).length,
  };

  const options = {
    method: "POST",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const req = request(
      url(Config.APPLICATION_ID, Config.GUILD_ID),
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

    req.write(JSON.stringify(payload));
    req.end();
  });
};
