import {SlashCommandBuilder} from 'discord.js'
import {CommandOptions} from '../types/index'
import {padZero} from '../utility/utility'

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Bot uptime'),
  async execute(interaction) {
    const totalSeconds = process.uptime()
    const days = Math.floor((totalSeconds % 31536000) / 86400)
    const hours = Math.floor(totalSeconds / 3600) % 24
    const minutes = Math.floor(totalSeconds / 60) % 60
    const seconds = Math.floor(totalSeconds % 60)

    let message = days >= 1 ? `${days}d ` : ''
    message += padZero(hours) + ':'
    message += padZero(minutes) + ':'
    message += padZero(seconds)
    await interaction.reply(message)
  },
  options: {
    disabled: false
  }
} as CommandOptions
