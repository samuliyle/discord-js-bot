import {
  CommandInteractionOptionResolver,
  SlashCommandSubcommandBuilder,
  userMention,
} from "discord.js";
import { CommandOptions } from "../types/index";

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("remind")
    .setDescription("Reminds in you in x minutes")
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("When should the bot remind you")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Reminder message")
    ),
  async execute(interaction) {
    const options = interaction.options as CommandInteractionOptionResolver;
    const minutes = options.getInteger("minutes", true);
    const reminderMessage = options.getString("message") ?? ":fire:";

    setTimeout(() => {
      const user = userMention(interaction.user.id);
      const message = `${user} :fire: REMEMBER: ${reminderMessage}! :fire:`;
      if (interaction.channel) {
        interaction.channel.send(
          `${user} :fire: REMEMBER: ${reminderMessage}! :fire:`
        );
      } else {
        interaction.user.send(message);
      }
    }, minutes * 60000);

    await interaction.reply(`Reminding you in ${minutes} minutes.`);
  },
  options: {
    disabled: false,
  },
} as CommandOptions;
