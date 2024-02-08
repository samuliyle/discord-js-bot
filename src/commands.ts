import {
  REST,
  Client,
  Collection,
  APIMessageComponent,
  Routes,
} from "discord.js";
import path from "path";
import fs from "fs";
import { logInfo, logWarning, logError, logDebug } from "./utility/log";
import { CommandOptions } from "./types";

export const setupCommands = (client: Client) => {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    logDebug(`Found: ${file}`);
    const filePath = path.join(commandsPath, file);
    const command: CommandOptions = require(filePath).default;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if (command && "data" in command && "execute" in command) {
      logInfo(`Loading command ${command.data.name} from ${filePath}`);
      client.commands.set(command.data.name, command);
    } else {
      logWarning(
        `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
};

export const registerCommands = async (client: Client, clientId: string) => {
  if (!client.token) {
    return;
  }

  const commands: APIMessageComponent[] = [];

  for (const [_, command] of client.commands) {
    commands.push(command.data.toJSON());
  }

  if (commands.length === 0) {
    logWarning("No commands loaded");
    return;
  }
  // Construct and prepare an instance of the REST module
  const rest = new REST({ version: "10" }).setToken(client.token);

  try {
    logInfo(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    logInfo("Successfully reloaded application (/) commands.");
  } catch (error) {
    logError(error);
  }
};
