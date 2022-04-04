/* eslint-disable no-console */
import produce from "immer";
import { Location, To } from "react-router";
import { combineUrlSegments, prependSlash } from "../utils";

// Segments are delimited by "/"

// A segment that ends a url - "5" in "/feed/photo/5"
// Pathname can be reconstructed from location in tree and is omited
export type LeafSegment = Omit<Location, "pathname"> & {
  type: "leaf";
};

// A segment that is inside a url - "feed" or "photo" in "/feed/photo/5"
export type BranchSegment = {
  type: "branch";
  pathnamePart: string;
  key: string;
};

export type Segment = LeafSegment | BranchSegment;

export type HistoryForPrefix = {
  index: number; // the current navigated to is the segment at position index
  segments: Segment[];
};

// For URL "/feed/photo/5" it can be either "/" or "/feed" or "/feed/photo"
export type Prefix = string;

export type NestedHistory = {
  segments: { [prefix: Prefix]: HistoryForPrefix; "/": HistoryForPrefix };
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

const reccurentGetLocationFromHistory = (
  history: NestedHistory,
  pathPrefix = "/"
): Location | null => {
  if (guard("reccurentGetUrlFromHistory", pathPrefix)) return null;
  const nextPrefixObject = history.segments[pathPrefix];
  if (!nextPrefixObject) {
    console.warn(`prefix not found in nested history for path ${pathPrefix}`);
    return null;
  }
  const segment = history.segments[pathPrefix].segments[nextPrefixObject.index];
  if (!segment) {
    console.warn(
      "prefix index does not point at a correct segment of history",
      pathPrefix,
      nextPrefixObject.index
    );
    return null;
  }
  if (segment.type === "leaf") {
    // we are at a feaf point, so the current URL ends at this segment.
    return { ...segment, pathname: "" };
  }
  const nextPrefix = combineUrlSegments(pathPrefix, segment.pathnamePart);
  const followingSegment = reccurentGetLocationFromHistory(history, nextPrefix);
  return {
    ...followingSegment,
    key: `${segment.key}/${followingSegment.key}`,
    pathname: prependSlash(
      combineUrlSegments(segment.pathnamePart, followingSegment.pathname)
    ),
  };
};

// export const getCurrentUrlFromHistory = (history: NestedHistory) => {
//   const url = combineUrlSegments(
//     "/",
//     reccurentGetUrlFromHistory(history).pathname
//   );
//   return url;
// };

export const getLocationFromHistory = (history: NestedHistory) => {
  // QUESTION: we might need to prepend "/"
  return reccurentGetLocationFromHistory(history);
};

export type GoConfig = {
  onPath?: string;
  direction?: "back" | "forward";
  count?: number;
};

export const getHistoryForPrefix = (
  history: NestedHistory,
  prefix: string,
  key = ""
): Location[] => {
  const root = history.segments[prefix];
  console.log({ root, prefix, segs: Object.keys(history.segments) });
  if (guard("getHistoryForPrefix", prefix)) return [];

  if (!root) return [];
  const successorHistory = root.segments
    .slice(0, root.index + 1)
    .flatMap((segment) =>
      segment.type === "leaf"
        ? [{ ...segment, pathname: prefix, key: `${key}/${segment.key}` }]
        : getHistoryForPrefix(
            history,
            combineUrlSegments(prefix, segment.pathnamePart),
            `${key}/${segment.key}`
          )
    );
  return successorHistory;
};

export type PrefixIndexes = { [prefix: string]: number };

export const getHistoryWithIndexesForPrefix = (
  history: NestedHistory,
  prefix: string,
  parentPrefixIndexes: PrefixIndexes,
  key = ""
): { location: Location; prefixIndexes: PrefixIndexes }[] => {
  if (guard("getHistoryWithIndexesForPrefix", prefix)) return [];

  const root = history.segments[prefix];

  if (!root) return [];
  const successorHistory = root.segments
    .slice(0, root.index + 1)
    .flatMap((segment, idx) =>
      segment.type === "leaf"
        ? [
            {
              location: {
                ...segment,
                pathname: prefix,
                key: `${key}/${segment.key}`,
              },
              prefixIndexes: {
                ...parentPrefixIndexes,
                [prefix]: idx,
              },
            },
          ]
        : getHistoryWithIndexesForPrefix(
            history,
            combineUrlSegments(prefix, segment.pathnamePart),
            {
              ...parentPrefixIndexes,
              [prefix]: idx,
            },
            `${key}/${segment.key}`
          )
    );
  return successorHistory;
};

export const applyPrefixIndexesToHistory = (
  history: NestedHistory,
  prefixIndexes: PrefixIndexes
) => {
  console.log("applyPrefixIndexesToHistory");
  const newHistory = produce(history, (draft) => {
    Object.keys(prefixIndexes).forEach((prefix) => {
      draft.segments[prefix].index = prefixIndexes[prefix];
    });
  });
  return newHistory;
};

const getAccessibleKeys = (history: NestedHistory, prefix = "/"): string[] => {
  if (guard("getAccessibleKeys", prefix)) return [];
  return [
    prefix,
    ...(history.segments[prefix] || { segments: [] }).segments.flatMap(
      (segment: Segment) =>
        segment.type === "branch"
          ? getAccessibleKeys(
              history,
              combineUrlSegments(prefix, segment.pathnamePart)
            )
          : []
    ),
  ];
};

function createKey() {
  return Math.random().toString(36).substr(2, 8);
}

const removeUnreachablePaths = ({ segments, ...rest }: NestedHistory) => {
  return { segments, ...rest }; // temp disable
  const accessibleKeys = getAccessibleKeys({ segments });
  return {
    segments: {
      "/": segments["/"],
      ...Object.fromEntries(
        accessibleKeys.map((k) => [k, segments[k]]).filter((f) => !!f[1])
      ),
    },
    ...rest,
  };
};
export const pushLocationToHistory = (
  history: NestedHistory,
  location: To,
  replace = false,
  state = null
) => {
  if (guard("pushLocationToHistory", location)) return history;

  const { pathname, ...leafSegment } =
    typeof location === "string" ? { pathname: location } : location;
  const newUrlSegments = [
    ...pathname
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
      if (!draft.segments[prefix]) {
        draft.segments[prefix] = {
          index: -1,
          segments: [],
        };
      }
      const currentSegment =
        draft.segments[prefix].segments[draft.segments[prefix].index];
      if (newSegment) {
        if (
          !currentSegment ||
          currentSegment.type !== "branch" ||
          currentSegment.pathnamePart !== newSegment
        ) {
          draft.segments[prefix].segments = [
            ...draft.segments[prefix].segments.slice(
              0,
              draft.segments[prefix].index + (replace ? 0 : 1)
            ),
            {
              pathnamePart: newSegment,
              type: "branch",
              key: createKey(),
            },
          ];
          draft.segments[prefix].index =
            draft.segments[prefix].segments.length - 1;
        }
        // this is the final segment
      } else if (!pathname.endsWith("*")) {
        if (
          !currentSegment ||
          currentSegment.type !== "leaf" ||
          // states are always considered different
          (!currentSegment.state && !!state) ||
          (!!currentSegment.state && !state) ||
          (!!currentSegment.state && !!state) ||
          currentSegment.search !== (leafSegment.search || "") ||
          currentSegment.hash !== (leafSegment.hash || "")
        ) {
          draft.segments[prefix].segments = [
            ...draft.segments[prefix].segments.slice(
              0,
              draft.segments[prefix].index + (replace ? 0 : 1)
            ),
            {
              key: createKey(),
              state,
              type: "leaf",
              search: leafSegment.search || "",
              hash: leafSegment.hash || "",
            },
          ];
          draft.segments[prefix].index =
            draft.segments[prefix].segments.length - 1;
        }
      } else if (draft.segments[prefix].index === -1) {
        draft.segments[prefix].segments = [
          {
            key: createKey(),
            state,
            search: leafSegment.search || "",
            hash: leafSegment.hash || "",
            type: "leaf",
          },
        ];
        draft.segments[prefix].index = 0;
      }
    });
  });
  return removeUnreachablePaths(newHistory);
};

// check if the onPath is ever used
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

  const url = getLocationFromHistory(history).pathname;
  const path = onPath?.startsWith("/")
    ? onPath
    : combineUrlSegments("/", onPath || url || undefined);
  const prefixes = history.segments[path];
  if (!prefixes) {
    return goRecursive(history, {
      onPath: combineUrlSegments(...path.split("/").slice(0, -1)),
      direction,
    });
  }
  // if undo can be performed at the current level
  if (
    direction === "back"
      ? history.segments[path].index <= 0
      : history.segments[path].index >=
        history.segments[path].segments.length - 1
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
    draft.segments[path].index += direction === "back" ? -1 : 1;
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
