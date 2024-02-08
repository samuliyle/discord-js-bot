import ping from '../../src/commands/ping'
import {CommandOptions} from '../../src/types'

describe('ping command', () => {
  test('has name, description and options', () => {
    const command: CommandOptions = ping
    expect(command.data.name).toBe('ping')
    expect(command.data.description).toBe('Replies with Pong!')
    expect(command.options.disabled).toBeFalsy()
  })

  test('responds with pong', async () => {
    const interaction = {
      reply: jest.fn()
    }
    const command: CommandOptions = ping
    await command.execute(interaction as any)
    expect(interaction.reply).toBeCalledWith('Pong!')
  })
})
