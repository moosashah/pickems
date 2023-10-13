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
import fetch from "node-fetch";

const sqs = new AWS.SQS();
export function createVotingSelectMenu({
  games,
  customId,
  placeholder,
}: CreateSelectMenu): Dropdown {
  const components = games.data.map((game) => {
    const { rSide, bSide } = pullNames(game);
    return {
      label: `${rSide} vs ${bSide}`,
      value: game.game_id,
    };
  });

  return [
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
  ];
}

export const pullNames = (game: any): { rSide: string; bSide: string } => {
  const rSide = teams[game.red_side.team_name as TeamKey];
  const bSide = teams[game.blue_side.team_name as TeamKey];

  return { rSide, bSide };
};

export const formatMatchLabel = (game: any) => {
  const { rSide, bSide } = pullNames(game);
  return `${rSide} vs ${bSide}`;
};

export function createPointsSelectMenu({
  games,
  customId,
  placeholder,
}: CreateSelectMenu): Dropdown {
  const components = games.data.flatMap((game) => {
    // const rSide = teams[game.red_side.team_name as TeamKey];
    // const bSide = teams[game.blue_side.team_name as TeamKey];
    const { rSide, bSide } = pullNames(game);
    const redSide = {
      label: `${rSide} vs ${bSide} -> Winner: ${rSide}`,
      value: `${game.game_id}#red_side`,
    };

    const blueSide = {
      label: `${rSide} vs ${bSide} -> Winner: ${bSide}`,
      value: `${game.game_id}#blue_side`,
    };
    return [redSide, blueSide];
  });

  return [
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
  ];
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

interface DropdownOption {
  label: string;
  value: string;
}

interface Component {
  type: number;
  custom_id: string;
  options: DropdownOption[];
  placeholder: string;
}

interface DropdownItem {
  type: number;
  components: Component[];
}

type Dropdown = DropdownItem[];

interface Reply {
  title: string;
  id: string;
  token: string;
  components?: Dropdown;
}

export const reply = async ({ title, id, token, components }: Reply) => {
  const url = `https://discord.com/api/v10/webhooks/${id}/${token}/messages/@original`;

  const params = {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bot " + Config.BOT_TOKEN,
    },
    body: JSON.stringify({
      type: 4,
      content: title,
      components,
    }),
  };

  try {
    return await fetch(url, params);
  } catch (err) {
    console.log(err);
    throw err;
  }
};
