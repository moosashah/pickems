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
- [x] Add team names to teams consts
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
          "label": "Team BDS",
          "value": "bds"
        },
        {
          "label": "Team Whales",
          "value": "tw"
        },
        {
          "label": "T1",
          "value": "t1"
        },
        {
          "label": "Weibo Gaming",
          "value": "wbg"
        },
        {
          "label": "G2 Esports",
          "value": "g2"
        },
        {
          "label": "GAM Esports",
          "value": "gam"
        },
        {
          "label": "Loud",
          "value": "lll"
        },
        {
          "label": "CTBC Flying Oyster",
          "value": "cfo"
        },
        {
          "label": "PSG Talon",
          "value": "psg"
        },
        {
          "label": "Detonation Focusme",
          "value": "dfm"
        },
        {
          "label": "NRG",
          "value": "nrg"
        },
        {
          "label": "Cloud9",
          "value": "c9"
        },
        {
          "label": "Team Liquid",
          "value": "tl"
        },
        {
          "label": "Fnatic",
          "value": "fnc"
        },
        {
          "label": "Mad Lions",
          "value": "mad"
        },
        {
          "label": "kt Rolster",
          "value": "kt"
        },
        {
          "label": "Gen.G",
          "value": "gen"
        },
        {
          "label": "Dplus KIA",
          "value": "dpk"
        },
        {
          "label": "JD Gaming",
          "value": "jdg"
        },
        {
          "label": "Bilibili Gaming",
          "value": "blg"
        },
        {
          "label": "LNG Esports",
          "value": "lng"
        },
        {
          "label": "Movistar 7",
          "value": "r7"
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
          "label": "Team BDS",
          "value": "bds"
        },
        {
          "label": "Team Whales",
          "value": "tw"
        },
        {
          "label": "T1",
          "value": "t1"
        },
        {
          "label": "Weibo Gaming",
          "value": "wbg"
        },
        {
          "label": "G2 Esports",
          "value": "g2"
        },
        {
          "label": "GAM Esports",
          "value": "gam"
        },
        {
          "label": "Loud",
          "value": "lll"
        },
        {
          "label": "CTBC Flying Oyster",
          "value": "cfo"
        },
        {
          "label": "PSG Talon",
          "value": "psg"
        },
        {
          "label": "Detonation Focusme",
          "value": "dfm"
        },
        {
          "label": "NRG",
          "value": "nrg"
        },
        {
          "label": "Cloud9",
          "value": "c9"
        },
        {
          "label": "Team Liquid",
          "value": "tl"
        },
        {
          "label": "Fnatic",
          "value": "fnc"
        },
        {
          "label": "Mad Lions",
          "value": "mad"
        },
        {
          "label": "kt Rolster",
          "value": "kt"
        },
        {
          "label": "Gen.G",
          "value": "gen"
        },
        {
          "label": "Dplus KIA",
          "value": "dpk"
        },
        {
          "label": "JD Gaming",
          "value": "jdg"
        },
        {
          "label": "Bilibili Gaming",
          "value": "blg"
        },
        {
          "label": "LNG Esports",
          "value": "lng"
        },
        {
          "label": "Movistar 7",
          "value": "r7"
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
