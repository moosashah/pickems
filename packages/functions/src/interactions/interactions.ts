import { APIGatewayEvent } from "aws-lambda";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { Function } from "sst/node/function";
import { Config } from "sst/node/config";
import Game, { type GetActiveGameResponse } from "@pickems/core/database/game";
import { CreateGame, Item, ParsedBody, teams } from "@pickems/core/types/types";
import nacl from "tweetnacl";
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

const extractGameId = (str: string) => (str.match(/\$vote\/(.*?)#/) || [])[1];
const extractPickId = (str: string) => (str.match(/#(.*)$/) || [])[1];

const createGameInDB = async (rd: string, blu: string) =>
  (
    await Game.create({
      red_side: { team_name: rd },
      blue_side: { team_name: blu },
    })
  ).data.game_id;

const createGame = async (body: CreateGame) => {
  const { options } = body.data;
  const blu = options.find((s) => s.name === "blue_side");
  const rd = options.find((s) => s.name === "red_side");
  if (!blu || !rd) {
    return { content: "Could not create game, missing teams" };
  }
  if (blu.value === rd.value) {
    return { content: "Teams cannot play themselves" };
  }
  const game_id = await createGameInDB(rd.value, blu.value);

  const opts = options.map((t) => ({
    type: 2,
    style: 2,
    label: teams[t.value],
    custom_id: `$vote/${game_id}#${t.name}`,
  }));

  const components = [
    {
      type: 1,
      components: opts,
    },
  ];

  return {
    content: `Match: ${teams[blu.value]} vs ${teams[rd.value]}`,
    components,
  };
};

const sendToSQS = async (item: Item) => {
  const params: AWS.SQS.SendMessageRequest = {
    QueueUrl: Queue.VotesQueue.queueUrl,
    MessageBody: JSON.stringify(item),
  };

  try {
    await sqs.sendMessage(params).promise();
  } catch (e) {
    console.error("error sending batch to votesQueue: ", e);
    throw e;
  }
};

const authenticate = (event: APIGatewayEvent): Boolean => {
  const sig =
    event.headers["x-signature-ed25519"] ||
    event.headers["X-Signature-Ed25519"];
  const ts =
    event.headers["x-signature-timestamp"] ||
    event.headers["X-Signature-Timestamp"];
  if (!sig || !ts || !event.body) {
    return false;
  }

  return nacl.sign.detached.verify(
    Buffer.from(ts + event.body),
    Buffer.from(sig, "hex"),
    Buffer.from(Config.PUBLIC_KEY, "hex")
  );
};

export const main = async (event: APIGatewayEvent) => {
  const body: ParsedBody = JSON.parse(event.body!);
  const { type, data } = body;
  const isVerified = authenticate(event);

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }

  if (type === InteractionType.PING) {
    return {
      statusCode: 200,
      body: JSON.stringify({ type: InteractionResponseType.PONG }),
    };
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    if (data.name === "ping") {
      const res = {
        type: 4,
        data: {
          content: "Pong!",
        },
      };
      return JSON.stringify(res);
    }

    if (data.name === "create-game") {
      if (!data.options) {
        return JSON.stringify({ type: 4, content: "No options" });
      }
      const str = await createGame(body as CreateGame);
      console.log({ str });
      return JSON.stringify({ type: 4, data: str });
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    //need to figure out point check payload
    const postData: Item = {
      appId: body.application_id,
      token: body.token,
      userId: body.member.user.id,
      pickId: data.custom_id,
    };
    if ((data.custom_id as string).startsWith("$vote")) {
      const gameId = extractGameId(body.data.custom_id);
      const pickId = extractPickId(body.data.custom_id);
      const voteData: Item = {
        appId: body.application_id,
        token: body.token,
        userId: body.member.user.id,
        pickId,
        gameId,
      };
      try {
        sendToSQS(voteData);
      } catch (e) {
        console.error("error sending to queue records: ", e);
        throw e;
      }
    }
    if (data.custom_id === "point_check") {
      lambda
        .invoke({
          FunctionName: Function.GetPointsFunction.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify(postData),
        })
        .promise();
      return JSON.stringify({
        type: 4,
        data: { content: "Getting your points...", flags: 64 },
      });
    }

    return JSON.stringify({
      type: 5,
      data: { flags: 64 },
    });
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: true }),
  };
};
