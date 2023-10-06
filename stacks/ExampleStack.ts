import { Api, Config, StackContext } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  const DISCORD_KEY = new Config.Secret(stack, "DISCORD_KEY");
  const PUBLIC_KEY = new Config.Secret(stack, "PUBLIC_KEY");
  const api = new Api(stack, "test", {
    routes: {
      "POST /interactions": "packages/functions/src/interactions.main",
    },
  });
  api.bind([DISCORD_KEY, PUBLIC_KEY]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
  return {
    DISCORD_KEY,
  };
}
