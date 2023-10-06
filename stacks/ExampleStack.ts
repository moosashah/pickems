import { Api, Config, StackContext } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  const DISCORD_KEY = new Config.Secret(stack, "DISCORD_KEY");
  const PUBLIC_KEY = new Config.Secret(stack, "PUBLIC_KEY");
  const APPLICATION_ID = new Config.Secret(stack, "APPLICATION_ID");
  const GUILD_ID = new Config.Secret(stack, "GUILD_ID");
  const api = new Api(stack, "test", {
    routes: {
      "POST /interactions": "packages/functions/src/interactions.main",
      "POST /register-command":
        "packages/functions/src/register-command.handler",
    },
  });
  api.bind([DISCORD_KEY, PUBLIC_KEY, APPLICATION_ID, GUILD_ID]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
