import { SSTConfig } from "sst";
import { ExampleStack } from "./stacks/ExampleStack";
import { CommandsStack } from "./stacks/CommandsStack";

export default {
  config(_input) {
    return {
      name: "pickems",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(ExampleStack).stack(CommandsStack)
  }
} satisfies SSTConfig;
