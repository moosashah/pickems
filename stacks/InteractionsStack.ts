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

  const table = new Table(stack, "db", {
    fields: {
      pk: "string",
      sk: "string",
      gsi1pk: "string",
      gsi1sk: "string",
      gsi2pk: "string",
      gsi2sk: "string",
    },
    primaryIndex: {
      partitionKey: "pk",
      sortKey: "sk",
    },
    globalIndexes: {
      gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" },
      gsi2: { partitionKey: "gsi2pk", sortKey: "gsi2sk" },
    },
  });

  const getPointsFunction = new Function(stack, "GetPointsFunction", {
    handler: "packages/functions/src/get-points.main",
    bind: [table, BOT_TOKEN],
  });

  const updateMessageFunction = new Function(stack, "UpdateMessage", {
    handler: "packages/functions/src/update-message.main",
    bind: [BOT_TOKEN],
  });

  const pointsQueue = new Queue(stack, "PointsQueue", {
    consumer: {
      function: {
        handler: "packages/functions/src/interactions/points-consumer.main",
        bind: [table],
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
        handler: "packages/functions/src/interactions/votes-consumer.main",
        bind: [table, updateMessageFunction],
      },
      cdk: {
        eventSource: {
          // batchSize: 25,
          maxConcurrency: 500,
          // maxBatchingWindow: toCdkDuration("30 seconds"),
        },
      },
    },
  });

  const api = new Api(stack, "Interactions", {
    defaults: {
      function: {
        bind: [table, pointsQueue, votesQueue, getPointsFunction],
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

  new Function(stack, "scrap", {
    handler: "packages/functions/src/scrap.handler",
    bind: [table],
  });
}
