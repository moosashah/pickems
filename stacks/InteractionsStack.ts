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

  const createLeaderboardFunction = new Function(stack, "CreateLeaderboard", {
    handler: "packages/functions/src/leaderboard.main",
    bind: [table, updateMessageFunction, BOT_TOKEN],
  });

  const updateRankingFunction = new Function(stack, "UpdateRanking", {
    handler: "packages/functions/src/update-ranks.main",
    bind: [table, updateMessageFunction, BOT_TOKEN],
  });

  const closeVotingFunction = new Function(stack, "CloseVoting", {
    handler: "packages/functions/src/interactions/close-voting.main",
    bind: [table, updateMessageFunction, BOT_TOKEN],
  });

  const closeVotingSelectionFunction = new Function(
    stack,
    "CloseVotingSelection",
    {
      handler: "packages/functions/src/interactions/close-voting.selection",
      bind: [table, updateMessageFunction, BOT_TOKEN],
    }
  );

  const createGameFunction = new Function(stack, "CreateGame", {
    handler: "packages/functions/src/interactions/create-game.main",
    bind: [table, updateMessageFunction, BOT_TOKEN],
  });

  const awardPointsFunction = new Function(stack, "AwardPoints", {
    handler: "packages/functions/src/interactions/award-points.main",
    bind: [table, updateMessageFunction, BOT_TOKEN],
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

  const awardPointsSelection = new Function(stack, "AwardPointsSelection", {
    handler: "packages/functions/src/interactions/award-points-selection.main",
    bind: [table, pointsQueue, BOT_TOKEN],
  });

  const api = new Api(stack, "Interactions", {
    defaults: {
      function: {
        bind: [
          table,
          pointsQueue,
          votesQueue,
          getPointsFunction,
          awardPointsSelection,
          awardPointsFunction,
          createLeaderboardFunction,
          updateRankingFunction,
          closeVotingFunction,
          closeVotingSelectionFunction,
          createGameFunction,
        ],
      },
    },
    routes: {
      "POST /interactions":
        "packages/functions/src/interactions/interactions.main",
    },
  });

  api.bind([BOT_TOKEN, PUBLIC_KEY]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  new Function(stack, "clearTable", {
    handler: "packages/functions/src/clearTable.handler",
    timeout: `30 seconds`,
    bind: [table],
  });

  new Function(stack, "scrap", {
    handler: "packages/functions/src/scrap.handler",
    bind: [table],
  });
}
