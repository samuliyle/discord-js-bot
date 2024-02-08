import google from "../../src/commands/google";
import {
  CommandOptions,
  GoogleErrorResponse,
  GoogleImageResponse,
} from "../../src/types";

jest.mock(
  "../../src/config/secrets.json",
  () => ({
    google: {
      id: "1",
      cx: "1",
    },
  }),
  {
    virtual: true,
  }
);

describe("google command", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const searchPhraseMock = jest.fn().mockReturnValue("hello");
  const amountMock = jest.fn().mockReturnValue(5);

  test("has name, description and options", () => {
    const command: CommandOptions = google;
    expect(command.data.name).toBe("google");
    expect(command.data.description).toBe("Returns Google image");
    expect(command.options.disabled).toBeFalsy();
  });

  test("responds with google image", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockImplementationOnce(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  title: "cat",
                  link: "www.com/cat",
                },
              ],
            } as GoogleImageResponse),
        })
      ) as jest.Mock
    );

    const interaction = {
      reply: jest.fn(),
      options: {
        getString: searchPhraseMock,
        getInteger: amountMock,
      },
    };

    const command: CommandOptions = google;
    await command.execute(interaction as any);

    expect(interaction.reply).toBeCalledWith("www.com/cat cat");

    expect(searchPhraseMock).toBeCalled();
    expect(searchPhraseMock).toBeCalledWith("searchphrase", true);
    expect(amountMock).toBeCalled();
    expect(amountMock).toBeCalledWith("start");

    expect(fetchSpy).toBeCalled();
    expect(fetchSpy).toBeCalledWith(
      "https://www.googleapis.com/customsearch/v1?q=hello&searchType=image&cx=1&num=1&start=5&imgsize=medium&key=1"
    );
  });

  test("responds with error message when image fetch fails", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockImplementationOnce(
      jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: {
                code: 403,
                message: "Forbidden",
              },
            } as GoogleErrorResponse),
        })
      ) as jest.Mock
    );

    const interaction = {
      reply: jest.fn(),
      options: {
        getString: searchPhraseMock,
        getInteger: amountMock,
      },
    };

    const command: CommandOptions = google;
    await command.execute(interaction as any);

    expect(interaction.reply).toBeCalledWith(
      "Google returned error 403: Forbidden"
    );

    expect(searchPhraseMock).toBeCalled();
    expect(searchPhraseMock).toBeCalledWith("searchphrase", true);
    expect(amountMock).toBeCalled();
    expect(amountMock).toBeCalledWith("start");

    expect(fetchSpy).toBeCalled();
    expect(fetchSpy).toBeCalledWith(
      "https://www.googleapis.com/customsearch/v1?q=hello&searchType=image&cx=1&num=1&start=5&imgsize=medium&key=1"
    );
  });

  test("responds with message when no images are found", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockImplementationOnce(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [],
            } as GoogleImageResponse),
        })
      ) as jest.Mock
    );

    const interaction = {
      reply: jest.fn(),
      options: {
        getString: searchPhraseMock,
        getInteger: amountMock,
      },
    };

    const command: CommandOptions = google;
    await command.execute(interaction as any);

    expect(interaction.reply).toBeCalledWith(
      "Google didn't return any images. :thinking:"
    );

    expect(searchPhraseMock).toBeCalled();
    expect(searchPhraseMock).toBeCalledWith("searchphrase", true);
    expect(amountMock).toBeCalled();
    expect(amountMock).toBeCalledWith("start");

    expect(fetchSpy).toBeCalled();
    expect(fetchSpy).toBeCalledWith(
      "https://www.googleapis.com/customsearch/v1?q=hello&searchType=image&cx=1&num=1&start=5&imgsize=medium&key=1"
    );
  });
});
