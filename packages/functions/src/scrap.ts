import Game from "@pickems/core/database/game";
export const handler = async () => {
  await Game.migration();
};
