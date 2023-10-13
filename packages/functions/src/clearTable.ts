import User from "@pickems/core/database/user";
// import Game from "@pickems/core/database/game";
// import Vote from "@pickems/core/database/vote";

export const handler = async () => {
  await Promise.all([
    await User.migration(),
    // await Vote.migration(),
    // await Game.migration(),
  ]);
  console.log("deleting everything");
};
