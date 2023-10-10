import { SSTConfig } from "sst";
import { InteractionsStack } from "./stacks/InteractionsStack";

export default {
  config(_input) {
    return {
      name: "pickems",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(InteractionsStack)
        if (app.stage !== 'prod') {
            app.setDefaultRemovalPolicy("destroy")
        }
  }
} satisfies SSTConfig;
