import uptime from "../../src/commands/uptime";
import { CommandOptions } from "../../src/types";

describe("uptime command", () => {
  test("has name, description and options", () => {
    const command: CommandOptions = uptime;
    expect(command.data.name).toBe("uptime");
    expect(command.data.description).toBe("Bot uptime");
    expect(command.options.disabled).toBeFalsy();
  });

  test("responds with uptime", async () => {
    const mockUptime = jest.spyOn(process, "uptime").mockReturnValue(100000);
    const interaction = {
      reply: jest.fn(),
    };
    const command: CommandOptions = uptime;
    await command.execute(interaction as any);
    
    expect(interaction.reply).toBeCalledWith("1d 03:46:40");
    expect(mockUptime).toBeCalled();
  });
});
