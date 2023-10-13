import Game from "@pickems/core/database/game";
import {
  createVotingSelectMenu,
  reply,
  formatMatchLabel,
} from "@pickems/core/utils";

interface MainFuncBody {
  token: string;
  appId: string;
}

export const main = async (event: MainFuncBody) => {
  const pl = await Game.getActiveGames();
  if (!pl.data.length)
    await reply({
      token: event.token,
      id: event.appId,
      title: "No active games",
    });

  const dropdown = createVotingSelectMenu({
    games: pl,
    customId: "close-voting-selection",
    placeholder: "Games",
  });

  try {
    await reply({
      title: "Select game to close voting for",
      id: event.appId,
      token: event.token,
      components: dropdown,
    });
  } catch (e) {
    console.log(e);
  }
};

interface InteractionFunctionBody extends MainFuncBody {
  gameId: string;
}

export const selection = async (event: InteractionFunctionBody) => {
  const game = await Game.closeVoting(event.gameId);

  if (game === "no game found")
    return await reply({
      token: event.token,
      id: event.appId,
      title: "Game already closed",
    });
  const label = formatMatchLabel(game.data);

  return await reply({
    token: event.token,
    id: event.appId,
    title: `Closed voting on: ${label}`,
  });
};
