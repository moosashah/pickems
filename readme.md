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




## Commands to register

[Register command docs][RGD]



### Ping
```
{
  "name": "ping",
  "description": "Replises with pong",
  "type": 1
}
```

### Create game
```
{
  "type": 1,
  "name": "create-game",
  "description": "Create pickems game",
  "options": [
    {
      "type": 3,
      "name": "red_side",
      "description": "Red side team",
      "required": true,
      "choices": [
        {
          "name": "Team BDS",
          "value": "bds"
        },
        {
          "name": "Team Whales",
          "value": "whales"
        },
        {
          "name": "T1",
          "value": "t1"
        },
        {
          "name": "weibo gaming",
          "value": "weibo"
        },
        {
          "name": "G2",
          "value": "g2"
        }
      ]
    },
    {
      "type": 3,
      "name": "blue_side",
      "description": "Blue side team",
      "required": true,
      "choices": [
        {
          "name": "Team BDS",
          "value": "bds"
        },
        {
          "name": "Team Whales",
          "value": "whales"
        },
        {
          "name": "T1",
          "value": "t1"
        },
        {
          "name": "weibo gaming",
          "value": "weibo"
        },
        {
          "name": "G2",
          "value": "g2"
        }
      ]
    }
  ]
}
```

### Close voting
```
{
  "type": 1,
  "name": "close-voting",
  "description": "Get drop down of open games and select one to close"
}
```

### Award points
```
{
  "type": 1,
  "name": "award-points",
  "description": "Get drop down of games and select one to award points for."
}
```

### Leaderboard
```
{
  "type": 1,
  "name": "leaderboard",
  "description": "See top 10"
}
```

### Get your point and rank
```
{
  "type": 1,
  "name": "points",
  "description": "Get your points and ranking"
}
```

### Update rankings
```
{
  "type": 1,
  "name": "update-ranking",
  "description": "Update user ranks in database"
}
```




[RGD]: https://discord.com/developers/docs/interactions/application-commands#registering-a-command
