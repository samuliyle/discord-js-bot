# discord-js-bot

Discord bot written in TypeScript using discord.js

## Commands

Now with slash commands

| Command | Parameters          | Description                                   |
| ------- | ------------------- | --------------------------------------------- |
| Google  | Image search phrase | Searches Google image                         |
| Ping    |                     | Ping pong                                     |
| Quote   |                     | Returns random message from the guild history |
| Remind  | minutes, message    | Reminds after given minutes                   |
| Uptime  |                     | Bots uptime                                   |

## Env values

Rename .env.sample to .env and enter bot token and client id to .env

(optional) Enter Google and Database values to enable Google and database commands.

## MySQL Database

Create database called 'discord' and import schema

```
mysql -u <username> -p
create database discord;
exit;
mysql -u <username> -p discord < schema.sql
```

## Usage

```
npm i
npm start
```
