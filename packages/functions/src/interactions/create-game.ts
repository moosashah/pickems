import Game from "@pickems/core/database/game";
import { Button, ButtonComponent, ParsedBody } from "@pickems/core/types";
import { teams } from "@pickems/core/teams";
import { formatMatchLabel, reply } from "@pickems/core/utils";

const createGameInDB = async (rd: string, blu: string) => {
  const res = await Game.create({
    red_side: { team_name: rd },
    blue_side: { team_name: blu },
  });
  return res.data;
};

export const main = async (event: ParsedBody) => {
  const { options } = event.data;
  if (!options) {
    return await reply({
      id: event.application_id,
      token: event.token,
      title: "Missing Options",
    });
  }
  const blu = options.find((s) => s.name === "blue_side");
  const rd = options.find((s) => s.name === "red_side");
  if (!blu || !rd) {
    return await reply({
      id: event.application_id,
      token: event.token,
      title: "Could not create game, missing teams",
    });
  }
  if (blu.value === rd.value) {
    return await reply({
      id: event.application_id,
      token: event.token,
      title: "Teams cannot play themselves bozo...",
    });
  }
  const game = await createGameInDB(rd.value, blu.value);

  const opts: Button[] = options.map((t) => ({
    type: 2,
    style: 2,
    label: teams[t.value],
    custom_id: `$vote/${game.game_id}#${t.name}`,
  }));

  const components: ButtonComponent[] = [
    {
      type: 1,
      components: opts,
    },
  ];

  const title = `Match: ${formatMatchLabel(game)}`;

  return await reply({
    id: event.application_id,
    token: event.token,
    title,
    components,
  });
};
