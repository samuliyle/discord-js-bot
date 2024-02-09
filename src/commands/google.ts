import secrets from '../config/secrets.json'
import {
  CommandInteractionOptionResolver,
  SlashCommandSubcommandBuilder
} from 'discord.js'
import {
  CommandOptions,
  GoogleErrorResponse,
  GoogleImageResponse
} from '../types/index'
import {randomIntFromInterval} from '../utility/utility'
import {logWarning} from '../utility/log'

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('google')
    .setDescription('Returns Google image')
    .addStringOption(option =>
      option
        .setName('searchphrase')
        .setDescription('Image search phrase')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('start')
        .setDescription(
          'Image index, pages have 10 images, so 11 would be 1st image of 2nd page.'
        )
        .setMinValue(0)
        .setMaxValue(99)
    ),
  async execute(interaction) {
    const options = interaction.options as CommandInteractionOptionResolver
    const searchPhrase = encodeURIComponent(
      options.getString('searchphrase', true)
    )
    const start = options.getInteger('start') ?? randomIntFromInterval(0, 15)

    const imageResponse = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${searchPhrase}&searchType=image&cx=${secrets.google.cx}&num=1&start=${start}&imgsize=medium&key=${secrets.google.id}`
    )

    const data = await imageResponse.json()
    if (!imageResponse.ok) {
      const errorResponse = data as GoogleErrorResponse
      logWarning(
        `Google image search returned error ${errorResponse.error.code}: ${errorResponse.error.message}`
      )
      await interaction.reply(
        `Google returned error ${errorResponse.error.code}: ${errorResponse.error.message}`
      )
      return
    }

    const okResponse = data as GoogleImageResponse
    const image = okResponse?.items?.[0]
    if (!image) {
      await interaction.reply("Google didn't return any images. :thinking:")
      return
    }

    await interaction.reply(`${image.link} ${image.title}`)
  },
  options: {
    disabled: !secrets.google?.cx || !secrets.google?.id,
    disabledReason: 'Google api tokens missing from secrets.'
  }
} as CommandOptions
