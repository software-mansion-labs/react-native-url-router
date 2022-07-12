import * as nativeHistory from "../src/history/nativeHistory";
const { getInitialHistoryForPath } = nativeHistory;

beforeEach(() => {
  jest.spyOn(nativeHistory, "createKey").mockReturnValue("test-key");
});

afterEach(() => {
  jest.spyOn(global.Math, "random").mockRestore();
});

test("Getting initial history for / returns a history of single segment /", () => {
  expect(getInitialHistoryForPath("/")).toEqual({
    segments: {
      "/": {
        index: 0,
        segments: [
          {
            hash: "",
            key: "test-key",
            search: "",
            state: null,
            type: "leaf",
          },
        ],
      },
    },
  });
});

test("Getting initial history for /app returns a history of single segment /app", () => {
  expect(getInitialHistoryForPath("/app")).toEqual({
    segments: {
      "/": {
        index: 0,
        segments: [
          {
            pathnamePart: "app",
            type: "branch",
            key: "test-key",
          },
        ],
      },
      "/app": {
        index: 0,
        segments: [
          {
            key: "test-key",
            state: null,
            type: "leaf",
            search: "",
            hash: "",
          },
        ],
      },
    },
  });
});
