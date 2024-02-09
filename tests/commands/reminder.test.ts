import reminder from '../../src/commands/reminder'
import {CommandOptions} from '../../src/types'

jest.useFakeTimers()

describe('reminder command', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  const messageMock = jest.fn().mockReturnValue('food')
  const minutesMock = jest.fn().mockReturnValue(10)

  test('has name, description and options', () => {
    const command: CommandOptions = reminder
    expect(command.data.name).toBe('remind')
    expect(command.data.description).toBe('Reminds in you in x minutes')
    expect(command.options.disabled).toBeFalsy()
  })

  test('reminds the caller in channel', async () => {
    const sendMock = jest.fn()
    const interaction = {
      reply: jest.fn(),
      options: {
        getString: messageMock,
        getInteger: minutesMock
      },
      user: {
        id: '1'
      },
      channel: {
        send: sendMock
      }
    }

    const command: CommandOptions = reminder
    await command.execute(interaction as any)

    expect(interaction.reply).toHaveBeenCalledWith(
      'Reminding you in 10 minutes.'
    )

    expect(messageMock).toHaveBeenCalled()
    expect(messageMock).toHaveBeenCalledWith('message')
    expect(minutesMock).toHaveBeenCalled()
    expect(minutesMock).toHaveBeenCalledWith('minutes', true)

    expect(sendMock).not.toHaveBeenCalled()

    jest.runAllTimers()

    expect(sendMock).toHaveBeenCalled()
    expect(sendMock).toHaveBeenCalledWith('<@1> :fire: REMEMBER: food! :fire:')
  })

  test('reminds the caller in a dm', async () => {
    const sendMock = jest.fn()
    const interaction = {
      reply: jest.fn(),
      options: {
        getString: messageMock,
        getInteger: minutesMock
      },
      user: {
        id: '1',
        send: sendMock
      }
    }

    const command: CommandOptions = reminder
    await command.execute(interaction as any)

    expect(interaction.reply).toHaveBeenCalledWith(
      'Reminding you in 10 minutes.'
    )

    expect(messageMock).toHaveBeenCalled()
    expect(messageMock).toHaveBeenCalledWith('message')
    expect(minutesMock).toHaveBeenCalled()
    expect(minutesMock).toHaveBeenCalledWith('minutes', true)

    expect(sendMock).not.toHaveBeenCalled()

    jest.runAllTimers()

    expect(sendMock).toHaveBeenCalled()
    expect(sendMock).toHaveBeenCalledWith('<@1> :fire: REMEMBER: food! :fire:')
  })
})
