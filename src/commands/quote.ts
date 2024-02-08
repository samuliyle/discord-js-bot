import {
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import { databaseConnectionOk, getRandomMessage } from "../database/database";
import { CommandOptions } from "../types/index";
import secrets from "../config/secrets.json";
import { formatTime } from "../utility/utility";

export default {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Returns a random quote")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many quotes")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const options = interaction.options as CommandInteractionOptionResolver;
    const amount = options.getInteger("amount", true);

    getRandomMessage(amount, (err, result) => {
      if (err) {
        throw err;
      }
      let quotes = "";
      result.forEach(
        (quote: { message: string; username: string; time: string }) => {
          if (quote) {
            const date = new Date(quote.time);
            quotes += `${quote.username}: "${quote.message}" (${formatTime(
              date
            )})\n`;
          }
        }
      );
      interaction.reply(quotes || "No quotes found.");
    });
  },
  options: {
    disabled:
      !secrets.database?.password ||
      !secrets.database?.username ||
      !databaseConnectionOk,
  },
} as CommandOptions;
