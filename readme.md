## Discord bot for worlds pickems?

idea is that an admin will create a poll. users will be able to vote on a team and win points if they're right. At the end you can see the winner with the highest points

intitially it was going to be a golang server but since its a lot of votes within 1-5 mins i was worried about scale/ddosing so make it serverless. also gives me a chance to play with sst

- [x] Create match
- [x] List matches
- [x] Close(update) match
- [x] Pick match winner
- [x] assigns points
- [x] list my points
- [x] Add electroDB
- [x] Leaderboards
- [x] Add ranking
- [x] Refactoring and code clean up
- [ ] Cron job to start game voting
- [ ] Cron job to close game voting
- [ ] Web scrap to get future games
- [ ] Hook to cron jobs
