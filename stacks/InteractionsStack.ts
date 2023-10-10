import {
  Api,
  Config,
  StackContext,
  Table,
  Queue,
  Function,
  toCdkDuration,
} from "sst/constructs";

export function InteractionsStack({ stack }: StackContext) {
  const BOT_TOKEN = new Config.Secret(stack, "BOT_TOKEN");
  const PUBLIC_KEY = new Config.Secret(stack, "PUBLIC_KEY");

  const usersTbl = new Table(stack, "Users", {
    fields: {
      id: "string",
      score: "number",
    },
    primaryIndex: {
      partitionKey: "id",
    },
  });

  const table = new Table(stack, "Votes", {
    fields: {
      id: "string",
      pick: "string",
    },
    primaryIndex: {
      partitionKey: "id",
    },
    globalIndexes: {
      GSI1: { partitionKey: "pick" },
    },
  });

  const pointsQueue = new Queue(stack, "PointsQueue", {
    consumer: {
      function: {
        handler: "packages/functions/src/interactions/points-consumer.main",
        bind: [usersTbl],
      },
    },
    cdk: {
      queue: {
        fifo: true,
      },
    },
  });

  const votesQueue = new Queue(stack, "VotesQueue", {
    consumer: {
      function: {
        handler: "packages/functions/src/interactions/followUp.main",
        bind: [table],
      },
      cdk: {
        eventSource: {
          batchSize: 25,
          maxConcurrency: 500,
          maxBatchingWindow: toCdkDuration("30 seconds"),
        },
      },
    },
  });

  const getPointsFunction = new Function(stack, "GetPointsFunction", {
    handler: "packages/functions/src/get-points.main",
    bind: [usersTbl, BOT_TOKEN],
  });

  const api = new Api(stack, "Interactions", {
    defaults: {
      function: {
        bind: [table, pointsQueue, usersTbl, votesQueue, getPointsFunction],
      },
    },
    routes: {
      "POST /interactions":
        "packages/functions/src/interactions/interactions.main",
      "POST /votes": "packages/functions/src/interactions/award-points.main",
    },
  });

  api.bind([BOT_TOKEN, PUBLIC_KEY]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
  return {
    BOT_TOKEN,
  };
}
