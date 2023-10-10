import { Api, Config, StackContext, use } from "sst/constructs";
import { InteractionsStack } from "./InteractionsStack";

export function CommandsStack({ stack }: StackContext) {
  const APPLICATION_ID = new Config.Secret(stack, "APPLICATION_ID");
  const GUILD_ID = new Config.Secret(stack, "GUILD_ID");
  const api = new Api(stack, "Commands", {
    routes: {
      "POST /create": "packages/functions/src/commands/create-command.handler",
      "DELETE /delete/:id":
        "packages/functions/src/commands/delete-command.handler",
      "GET /": "packages/functions/src/commands/list-command.handler",
      "GET /:id": "packages/functions/src/commands/get-command.handler",
    },
  });
  api.bind([APPLICATION_ID, GUILD_ID, use(InteractionsStack).BOT_TOKEN]);
  stack.addOutputs({
    ApiEndpoint: `${api.url}/commands`,
  });
}
