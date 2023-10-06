import { SSTConfig } from "sst";
import { CommandsStack } from "./stacks/CommandsStack";
import { InteractionsStack } from "./stacks/InteractionsStack";

export default {
  config(_input) {
    return {
      name: "pickems",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(InteractionsStack).stack(CommandsStack)
  }
} satisfies SSTConfig;
