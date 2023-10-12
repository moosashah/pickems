import {
  CreateGame,
  CreateSelectMenu,
  Item,
  TeamKey,
  teams,
  Event,
} from "./types";
import AWS from "aws-sdk";
import Game from "../core/database/game";
import { Queue } from "sst/node/queue";
import { Config } from "sst/node/config";

const sqs = new AWS.SQS();
export function createVotingSelectMenu({
  games,
  title,
  customId,
  placeholder,
}: CreateSelectMenu) {
  const components = games.data.map((game) => ({
    label: `${teams[game.red_side.team_name as TeamKey]} vs ${
      teams[game.blue_side.team_name as TeamKey]
    }`,
    value: game.game_id,
  }));

  return {
    content: title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: customId,
            options: components,
            placeholder,
          },
        ],
      },
    ],
  };
}

export function createPointsSelectMenu({
  games,
  title,
  customId,
  placeholder,
}: CreateSelectMenu) {
  const components = games.data.flatMap((game) => {
    const rSide = teams[game.red_side.team_name as TeamKey];
    const bSide = teams[game.blue_side.team_name as TeamKey];
    const redSide = {
      label: `${teams[game.red_side.team_name as TeamKey]} vs ${
        teams[game.blue_side.team_name as TeamKey]
      } -> Winner: ${rSide}`,
      value: `${game.game_id}#red_side`,
    };

    const blueSide = {
      label: `${teams[game.red_side.team_name as TeamKey]} vs ${
        teams[game.blue_side.team_name as TeamKey]
      } -> Winner: ${bSide}`,
      value: `${game.game_id}#blue_side`,
    };
    return [redSide, blueSide];
  });

  return {
    content: title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: customId,
            options: components,
            placeholder,
          },
        ],
      },
    ],
  };
}

export const extractGameId = (str: string) =>
  (str.match(/\$vote\/(.*?)#/) || [])[1];
export const extractPickId = (str: string) => (str.match(/#(.*)$/) || [])[1];

export const createGameInDB = async (rd: string, blu: string) =>
  (
    await Game.create({
      red_side: { team_name: rd },
      blue_side: { team_name: blu },
    })
  ).data.game_id;

export const createGame = async (body: CreateGame) => {
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

export const sendToVotesQueue = async (item: Item) => {
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

export const authenticate = (event: Event, nacl: any): Boolean => {
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
