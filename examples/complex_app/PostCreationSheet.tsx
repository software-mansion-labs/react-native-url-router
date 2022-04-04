import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  Link,
  StackNavigator,
  useNestedHistoryContext,
} from "react-native-url-router";
import {
  matchPath,
  Route,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router";
const PostCreationSheet = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigate = useNavigate();

  // variables
  const snapPoints = useMemo(() => ["50%"], []);

  // callbacks

  const { getHistoryForPrefix } = useNestedHistoryContext();
  const prefixHistory = getHistoryForPrefix("/createPost");
  const lastHistoryItem = prefixHistory?.[prefixHistory.length - 1];
  console.log({ lastHistoryItem, prefixHistory });
  const showModal = matchPath("/createPost/*", lastHistoryItem?.pathname || "");
  useEffect(() => {
    if (showModal) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [showModal]);
  return (
    <BottomSheet
      ref={bottomSheetRef}
      animateOnMount
      index={showModal ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={() => {
        if (showModal) {
          navigate("", { state: {} });
        }
      }}
    >
      <View style={styles.contentContainer}>
        <Link to="/app/*">
          <Text>Close 🎉</Text>
        </Link>
        <Link to="/createPost/rich">
          <Text>Richtext</Text>
        </Link>
        <StackNavigator
          defaultScreenConfig={{
            stackHeaderConfig: {
              backgroundColor: "white",
              topInsetEnabled: false,
            },
          }}
        >
          <Route
            path="createPost/"
            element={<Text>Type up your post here</Text>}
          />
          <Route
            path="createPost/rich"
            element={<Text>Maybe create a rich text</Text>}
          />
        </StackNavigator>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

export default PostCreationSheet;
