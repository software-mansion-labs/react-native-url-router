/* eslint-disable no-console */
import produce from "immer";
import { combineUrlSegments } from "../utils";

export type PrefixHistory = {
  index: number;
  segments: string[];
};

export type NestedHistory = {
  prefixes: { [prefix: string]: PrefixHistory; "/": PrefixHistory };
};

let count = 0;
let lastOp = "";
const guard = (op: string, ...log: any) => {
  if (op !== lastOp) {
    lastOp = op;
    count = 0;
    return false;
  }
  if (count < 1000) {
    // eslint-disable-next-line no-plusplus
    count++;
    return false;
  }
  console.warn(
    "An issue in the react-native-url-router has caused an infinite loop - something is broken.",
    op,
    log
  );
  return true;
};

const reccurentGetUrlFromHistory = (
  history: NestedHistory,
  pathPrefix = "/"
): string => {
  if (guard("reccurentGetUrlFromHistory", pathPrefix)) return "";
  const nextPrefixObject = history.prefixes[pathPrefix];
  if (!nextPrefixObject) {
    console.warn(`prefix not found in nested history for path ${pathPrefix}`);
    return "";
  }
  const segment = history.prefixes[pathPrefix].segments[nextPrefixObject.index];
  if (!segment) {
    console.warn(
      "prefix index does not point at a correct segment of history",
      pathPrefix,
      nextPrefixObject.index
    );
    return "";
  }
  if (segment.startsWith("$")) {
    // we are at a $ point, so the current URL ends at this segment.
    return segment.slice(1);
  }
  const nextPrefix = combineUrlSegments(pathPrefix, segment);
  return combineUrlSegments(
    segment,
    reccurentGetUrlFromHistory(history, nextPrefix)
  );
};

export const getCurrentUrlFromHistory = (history: NestedHistory) => {
  const url = combineUrlSegments("/", reccurentGetUrlFromHistory(history));
  return url;
};

export type GoConfig = {
  onPath?: string;
  direction?: "back" | "forward";
  count?: number;
};

export const getHistoryForPrefix = (
  history: NestedHistory,
  prefix: string
): string[] => {
  const root = history.prefixes[prefix];
  if (guard("getHistoryForPrefix", prefix)) return [];

  if (!root) return [];
  const successorHistory = root.segments
    .slice(0, root.index + 1)
    .flatMap((segment) =>
      segment.startsWith("$")
        ? [prefix + segment.slice(1)]
        : getHistoryForPrefix(history, combineUrlSegments(prefix, segment))
    );
  return successorHistory;
};

export type PrefixIndexes = { [prefix: string]: number };

export const getHistoryWithIndexesForPrefix = (
  history: NestedHistory,
  prefix: string,
  parentPrefixIndexes: PrefixIndexes
): { url: string; prefixIndexes: PrefixIndexes }[] => {
  if (guard("getHistoryWithIndexesForPrefix", prefix)) return [];

  const root = history.prefixes[prefix];

  if (!root) return [];
  const successorHistory = root.segments
    .slice(0, root.index + 1)
    .flatMap((segment, idx) =>
      segment.startsWith("$")
        ? [
            {
              url: prefix + segment.slice(1),
              prefixIndexes: {
                ...parentPrefixIndexes,
                [prefix]: idx,
              },
            },
          ]
        : getHistoryWithIndexesForPrefix(
            history,
            combineUrlSegments(prefix, segment),
            {
              ...parentPrefixIndexes,
              [prefix]: idx,
            }
          )
    );
  return successorHistory;
};

export const applyPrefixIndexesToHistory = (
  history: NestedHistory,
  prefixIndexes: PrefixIndexes
) => {
  const newHistory = produce(history, (draft) => {
    Object.keys(prefixIndexes).forEach((prefix) => {
      draft.prefixes[prefix].index = prefixIndexes[prefix];
    });
  });
  return newHistory;
};

const getAccessibleKeys = (history: NestedHistory, prefix = "/"): string[] => {
  if (guard("getAccessibleKeys", prefix)) return [];
  return [
    prefix,
    ...(history.prefixes[prefix] || { segments: [] }).segments.flatMap(
      (segment) =>
        getAccessibleKeys(history, combineUrlSegments(prefix, segment))
    ),
  ];
};

const removeUnreachablePaths = ({ prefixes, ...rest }: NestedHistory) => {
  const accessibleKeys = getAccessibleKeys({ prefixes });
  return {
    prefixes: {
      "/": prefixes["/"],
      ...Object.fromEntries(
        accessibleKeys.map((k) => [k, prefixes[k]]).filter((f) => !!f[1])
      ),
    },
    ...rest,
  };
};
export const pushUrlToHistory = (
  history: NestedHistory,
  url: string,
  replace = false
) => {
  const [pathUrl, queryParams] = url.split("?");
  console.log("pushUrlToHistory", pathUrl, queryParams);
  const newUrlSegments = [
    ...pathUrl
      .replace(/(\*|\/)$/, "")
      .split("/")
      .filter((f) => !!f), // url contains empty string, fix!
  ];
  const newHistory = produce(history, (draft) => {
    [...newUrlSegments, null].forEach((newSegment, newUrlSegmentIndex) => {
      const prefix = combineUrlSegments(
        "/",
        ...newUrlSegments.slice(0, newUrlSegmentIndex)
      );
      if (!draft.prefixes[prefix]) {
        draft.prefixes[prefix] = {
          index: -1,
          segments: [],
        };
      }
      if (newSegment) {
        if (
          draft.prefixes[prefix].segments[draft.prefixes[prefix].index] !==
          newSegment
        ) {
          draft.prefixes[prefix].segments = [
            ...draft.prefixes[prefix].segments.slice(
              0,
              draft.prefixes[prefix].index + (replace ? 0 : 1)
            ),
            newSegment,
          ];
          draft.prefixes[prefix].index =
            draft.prefixes[prefix].segments.length - 1;
        }
        // you cant have a URL with a star and query params (or can you?)
        // they could override the query params of the leaf, but then you don't know where the QP will end up
      } else if (!url.endsWith("*")) {
        draft.prefixes[prefix].segments = [
          queryParams ? `$?${queryParams}` : "$",
        ];
        draft.prefixes[prefix].index = 0;
      } else if (draft.prefixes[prefix].index === -1) {
        draft.prefixes[prefix].segments = [
          queryParams ? `$?${queryParams}` : "$",
        ];
        draft.prefixes[prefix].index = 0;
      }
      //  pretty sure we want nostar links to reset the history of the node
      //  else if (
      //   !url.endsWith("*") &&
      //   draft.prefixes[prefix].segments[draft.prefixes[prefix].index] !== "$"
      // ) {
      //   draft.prefixes[prefix].segments = ["$"];
      //   draft.prefixes[prefix].index = 0;
      // } else if (draft.prefixes[prefix].index === -1) {
      //   draft.prefixes[prefix].segments = ["$"];
      //   draft.prefixes[prefix].index += 1;
      // }
    });
  });
  return removeUnreachablePaths(newHistory);
};

const goRecursive = (
  history: NestedHistory,
  {
    onPath,
    direction,
  }: {
    onPath?: string;
    direction?: "back" | "forward";
  }
): { handled: boolean; history: NestedHistory } => {
  if (guard("goRecursive", onPath)) return { handled: false, history };
  // we are at a $ point
  // we are going back in history up to a point where we can subtract an index without leaving it at -1 (there are at last two items on the stack)

  const url = getCurrentUrlFromHistory(history);
  const path = onPath?.startsWith("/")
    ? onPath
    : combineUrlSegments("/", onPath || url || undefined);
  const prefixes = history.prefixes[path];
  if (!prefixes) {
    return goRecursive(history, {
      onPath: combineUrlSegments(...path.split("/").slice(0, -1)),
      direction,
    });
  }
  // if undo can be performed at the current level
  if (
    direction === "back"
      ? history.prefixes[path].index <= 0
      : history.prefixes[path].index >=
        history.prefixes[path].segments.length - 1
  ) {
    if (path === "/") {
      return { history, handled: false };
    }
    return goRecursive(history, {
      onPath: combineUrlSegments(...path.split("/").slice(0, -1)),
      direction,
    });
  }
  const newHistory = produce(history, (draft) => {
    draft.prefixes[path].index += direction === "back" ? -1 : 1;
  });
  return { history: newHistory, handled: true };
};
export const go = (
  history: NestedHistory,
  config?: {
    onPath?: string;
    direction?: "back" | "forward";
    count?: number;
  }
): { handled: boolean; history: NestedHistory } => {
  if (guard("go", config)) return { handled: false, history };
  let i = config?.count || 1;
  let lastResult = { handled: true, history };
  while (i > 0 && lastResult.handled) {
    lastResult = goRecursive(history, config || { direction: "back" });
    i -= 1;
  }
  return {
    handled: lastResult.handled,
    history: removeUnreachablePaths(lastResult.history),
  };
};
