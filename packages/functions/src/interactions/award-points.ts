import Game from "@pickems/core/database/game";
import { createPointsSelectMenu, reply } from "@pickems/core/utils";

interface FuncBody {
  token: string;
  appId: string;
}

export const main = async (event: FuncBody) => {
  const pl = await Game.getUnrewardedGames();
  if (!pl.data.length) {
    return await reply({
      title: "No unrewarded games",
      id: event.appId,
      token: event.token,
    });
  }
  const dropdown = createPointsSelectMenu({
    games: pl,
    placeholder: "Games",
    customId: "award-points-selection",
  });

  return await reply({
    title: "Select game to award points for",
    token: event.token,
    id: event.appId,
    components: dropdown,
  });
};
