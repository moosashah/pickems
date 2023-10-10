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
  const url = `https://discord.com/api/v10/applications/${Config.APPLICATION_ID}/guilds/${Config.GUILD_ID}/commands`;

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
    const req = request(url, options, (res) => {
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
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
};
