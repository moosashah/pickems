import { Api, Config, StackContext, Function } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  const DISCORD_KEY = new Config.Secret(stack, "DISCORD_KEY");
  const PUBLIC_KEY = new Config.Secret(stack, "PUBLIC_KEY");
  const api = new Api(stack, "test", {
    authorizers: {
      discordAuth: {
        type: "lambda",
        function: new Function(stack, "DiscordAuth", {
          handler: "packages/functions/src/discordAuth.handler",
        }),
      },
    },
    defaults: {
      authorizer: "discordAuth",
    },
    routes: {
      "GET /ezauth": {
        function: "packages/functions/src/foo.main",
        authorizer: "none",
      },
      "POST /interactions": {
        function: "packages/functions/src/interactions.main",
        authorizer: "discordAuth",
      },
      "GET /public": {
        function: "packages/functions/src/bar.main",
        authorizer: "none",
      },
    },
  });
  api.bind([DISCORD_KEY, PUBLIC_KEY]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
