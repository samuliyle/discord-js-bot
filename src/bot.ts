import {Events, Client, GatewayIntentBits} from 'discord.js'
import secrets from './config/secrets.json'
import {registerCommands, setupCommands} from './commands'
import {logError, logInfo, logWarning} from './utility/log'
import {CommandOptions} from './types'
import {insertMessage} from './database/database'

if (!secrets.bot.token) {
  throw new Error('Bot token missing from secrets.json')
}
if (!secrets.bot.clientId) {
  throw new Error('Bot clientId missing from secrets.json')
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
})
client.login(secrets.bot.token)

client.once(Events.ClientReady, c => {
  logInfo(`Ready! Logged in as ${c.user.tag}`)
  setupCommands(client)
  logInfo('Commands loaded')
  registerCommands(client, secrets.bot.clientId)
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
    await interaction.reply({
      content: 'This command is disabled.'
    })
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    logError(error)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    })
  }
})
