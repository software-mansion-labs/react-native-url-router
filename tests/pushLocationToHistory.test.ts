import { vi, beforeEach, afterEach, test, expect, describe } from "vitest";
import * as nativeHistory from "../src/history/nativeHistory";

const { pushLocationToHistory } = nativeHistory;

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
    "/first": {
      // Should it be removed
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

describe("Replacing", () => {
  describe("an absolute pathname", () => {
    test("leaves only one segment in the path", () => {
      const firstNavHistory = pushLocationToHistory(
        nativeHistory.defaultNestedHistory,
        {
          pathname: "/first",
        }
      );
      const secondNavHistory = pushLocationToHistory(
        firstNavHistory,
        {
          pathname: "/second",
        },
        true
      );
      expect(secondNavHistory).toEqual(historyAfterTwoPushesWithReplace);
    });
  });

  const historyAfterTwoPushesWithNestedReplace = {
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
      "/second": {
        index: 0,
        segments: [
          {
            pathnamePart: "firstTab",
            type: "branch",
            key: "test-key",
          },
        ],
      },
      "/second/firstTab": {
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

  describe("a nested segment", () => {
    test("doesn't replace on all levels of hierarchy", () => {
      // is this expected?
      const firstNavHistory = pushLocationToHistory(
        nativeHistory.defaultNestedHistory,
        {
          pathname: "/second",
        }
      );
      const secondNavHistory = pushLocationToHistory(
        firstNavHistory,
        {
          pathname: "/second/firstTab",
        },
        true
      );
      expect(secondNavHistory).toEqual(historyAfterTwoPushesWithNestedReplace);
    });
  });

  const historyBeforeLogin = {
    history: {
      segments: {
        "/": {
          index: 0,
          segments: [
            {
              key: "default",
              pathnamePart: "app",
              type: "branch",
            },
          ],
        },
        "/app": {
          index: 0,
          segments: [
            {
              key: "test-key",
              pathnamePart: "login",
              type: "branch",
            },
          ],
        },
        "/app/login": {
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
    },
  };

  describe("a nested segment", () => {
    test("doesn't replace on all levels of hierarchy", () => {
      const firstNavHistory = pushLocationToHistory(
        nativeHistory.defaultNestedHistory,
        {
          pathname: "/app/book",
        },
        true
      );
      d(firstNavHistory);
      // expect(firstNavHistory).toEqual(historyAfterTwoPushesWithNestedReplace);
    });
  });
});
