# discord-js-bot

A rewrite/restructuring of my [discordBot](https://github.com/wraithyz/discordBot) in JavaScript.

## Commands

Command prefix: !

Info commands
------

Command | Parameters | Description
--- | --- | ---
Command | command name | Usage stats of command
Userinfo | username/nickname/mention | User info (creation date etc)
Channelinfo |  | Channel info (creation date etc)
Guildinfo |  | Guild info (creation date etc)
Info |  | Info about the bot
Uptime |  | Bots uptime

Api commands
------

Command | Parameters | Description
--- | --- | ---
Bing | search text | Random image from Bing
Imgur | Subreddit name | Random imgur image from subreddit
Mörkö | message | Uses Cleverbot to answer the message
Cat | | Random cat image

Message log commands
------

Command | Parameters | Description
--- | --- | ---
Quote | (number of quotes) | Random quotes from the channel
Phrase | search phrase | Random quote containing the phrase
Phrasecount | search phrase | Number of quotes containing the phrase
Last | search phrase | Last quote containing the phrase
First | search phrase | First quote containing the phrase

Twitch commands
------

Command | Parameters | Description
--- | --- | ---
Addalert | twitch channel name | Adds a alert that will inform when Twitch channel comes online
Removealert | twitch channel name | Removes the alert
Alerts | | Lists the users alerts

Various commands
------

Command | Parameters | Description
--- | --- | ---
8Ball | question | 8Ball answer
