import * as nativeHistory from "../src/history/nativeHistory";
const { pushLocationToHistory } = nativeHistory;

beforeEach(() => {
  jest.spyOn(nativeHistory, "createKey").mockReturnValue("test-key");
});

afterEach(() => {
  jest.spyOn(global.Math, "random").mockRestore();
});

const d = (debugValue: any) => console.log(JSON.stringify(debugValue, null, 2));

const historyAfterTwoPushes = {
  segments: {
    "/": {
      index: 1,
      segments: [
        {
          hash: "",
          search: "",
          type: "leaf",
          key: "default",
          state: {},
        },
        {
          pathnamePart: "app",
          type: "branch",
          key: "test-key",
        },
      ],
    },
    "/app": {
      index: 1,
      segments: [
        {
          key: "test-key",
          state: null,
          type: "leaf",
          search: "",
          hash: "",
        },
        {
          pathnamePart: "firstTab",
          type: "branch",
          key: "test-key",
        },
      ],
    },
    "/app/firstTab": {
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
};

describe("Pushing an absolute pathname", () => {
  test("twice adds two leaf segments", () => {
    const firstNavHistory = pushLocationToHistory(
      nativeHistory.defaultNestedHistory,
      {
        pathname: "/app",
      }
    );
    const secondNavHistory = pushLocationToHistory(firstNavHistory, {
      pathname: "/app/firstTab",
    });
    expect(secondNavHistory).toEqual(historyAfterTwoPushes);
  });

  const historyAfterANestedPush = {
    segments: {
      "/": {
        index: 1,
        segments: [
          {
            hash: "",
            search: "",
            type: "leaf",
            key: "default",
            state: {},
          },
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
            pathnamePart: "firstTab",
            type: "branch", // Note that it's only a branch segment
            key: "test-key",
          },
        ],
      },
      "/app/firstTab": {
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
  };

  test("that is nested adds one branch and one leaf segment", () => {
    const firstNavHistory = pushLocationToHistory(
      nativeHistory.defaultNestedHistory,
      {
        pathname: "/app/firstTab",
      }
    );
    expect(firstNavHistory).toEqual(historyAfterANestedPush);
  });
});

const historyAfterTwoPushesWithReplace = {
  segments: {
    "/": {
      index: 1,
      segments: [
        {
          hash: "",
          search: "",
          type: "leaf",
          key: "default",
          state: {},
        },
        {
          pathnamePart: "second",
          type: "branch",
          key: "test-key",
        },
      ],
    },
    "/first": { // Should it be removed 
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
    "/second": {
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
};

describe("Replacing an absolute pathname", () => {
  test("leaves only one segment in the path", () => {
    const firstNavHistory = pushLocationToHistory(
      nativeHistory.defaultNestedHistory,
      {
        pathname: "/first",
      }
    );
    const secondNavHistory = pushLocationToHistory(firstNavHistory, {
      pathname: "/second",
    },true);
    expect(secondNavHistory).toEqual(historyAfterTwoPushesWithReplace);
  });
});
