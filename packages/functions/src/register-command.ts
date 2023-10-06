import { request } from "https";
import { Config } from "sst/node/config";

export const handler = async () => {
  const url = (app_id: string, guild_id: string) =>
    `https://discord.com/api/v10/applications/${app_id}/guilds/${guild_id}/commands`;

  const payload = {
    name: "ping",
    description: "Replises with pong",
    type: 1,
  };

  // For authorization, you can use either your bot token
  const headers = {
    Authorization: `Bot ${Config.DISCORD_KEY}`, // OR use "Bearer <my_credentials_token>" for client credentials
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
