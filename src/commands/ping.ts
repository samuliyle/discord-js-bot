import {SlashCommandBuilder} from 'discord.js'
import {CommandOptions} from '../types/index'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    await interaction.reply('Pong!')
  },
  options: {
    disabled: false
  }
} as CommandOptions
