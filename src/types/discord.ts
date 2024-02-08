import {Collection} from 'discord.js'
import {CommandOptions} from '.'

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, CommandOptions>
  }
}
