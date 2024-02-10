import 'dotenv/config'
import {Events, Client, GatewayIntentBits} from 'discord.js'
import {registerCommands, setupCommands} from './commands'
import {logError, logInfo, logWarning} from './utility/log'
import {CommandOptions} from './types'
import {insertMessage} from './database/database'

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN value missing from env values')
}
if (!process.env.BOT_CLIENT_ID) {
  throw new Error('BOT_CLIENT_ID value missing from env values')
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
})
client.login(process.env.BOT_TOKEN)

client.once(Events.ClientReady, c => {
  logInfo(`Ready! Logged in as ${c.user.tag}`)
  setupCommands(client)
  logInfo('Commands loaded')
  registerCommands(client, process.env.BOT_CLIENT_ID!)
})

client.on(Events.MessageCreate, async message => {
  if (!message.guildId || message.author.bot || !message.content) {
    return
  }
  insertMessage(message)
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) {
    return
  }
  const location = interaction.inGuild() ? `guild ${interaction.guildId}` : 'DM'

  logInfo(
    `${interaction.user.username}#${interaction.user.discriminator} (${
      interaction.user.id
    }) used command ${interaction.commandName} with options ${JSON.stringify(
      interaction.options.data
    )} in channel ${interaction.channelId} in ${location}`
  )
  // database.logCommand(command, parameters.slice(1), message, null, 0);

  const command: CommandOptions | undefined = interaction.client.commands.get(
    interaction.commandName
  )

  if (!command) {
    logWarning(`No command matching ${interaction.commandName} was found.`)
    return
  }

  if (command.options.disabled) {
    let disabledResponse = 'This command is disabled.'
    if (command.options.disabledReason) {
      disabledResponse += ` (${command.options.disabledReason})`
    }
    await interaction.reply({
      content: disabledResponse
    })
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    logError(`Failed to execute command ${interaction.commandName}`, error)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    })
  }
})
