# discord-js-bot

Discord bot written in TypeScript using discord.js

## Commands

Now with slash commands

| Command | Parameters                  | Description                                   |
| ------- | --------------------------- | --------------------------------------------- |
| Chat    | Message to write to the bot | Returns cleverbot answer                      |
| Google  | Image search phrase         | Searches Google image                         |
| Ping    |                             | Ping pong                                     |
| Quote   |                             | Returns random message from the guild history |
| Remind  | minutes, message            | Reminds after given minutes                   |
| Uptime  |                             | Bots uptime                                   |

## Secrets

Rename secrets_sample.json to secrets.json.

Enter bot token and client id to secrets.json.

(optional) Enter Google, Database, Cleverbot secrets to enable Google, Cleverbot and database commands.

## MySQL Database

Create database called 'discord' and import schema

```
mysql -u <username> -p
create database discord;
exit;
mysql -u <username> -p discord < schema.sql
```
