// @ts-ignore
import Cleverbot from "cleverbot-node";
import secrets from "../config/secrets.json";
import {
  CommandInteractionOptionResolver,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { CommandOptions } from "../types/index";

const cleverbot = new Cleverbot();
if (secrets.cleverbot?.key) {
  cleverbot.configure({ botapi: secrets.cleverbot?.key });
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("chat")
    .setDescription("Chat with bot")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message to write to the bot")
        .setRequired(true)
    ),
  async execute(interaction) {
    const options = interaction.options as CommandInteractionOptionResolver;
    const message = options.getString("message", true);

    cleverbot.write(message, async (response: any) => {
      await interaction.reply(
        `**${interaction.user.username}**: ${message}\n**${interaction.client.user.username}**: ${response.output}`
      );
    });
  },
  options: {
    disabled: !secrets.cleverbot?.key,
  },
} as CommandOptions;
