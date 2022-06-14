import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { StackOrRoutes, Route, useNavigate, Link } from "./combinedexports";
const PostCreationSheet = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigate = useNavigate();

  // variables
  const snapPoints = useMemo(() => ["50%"], []);

  // callbacks

  const match = true; // useMatch("/createPost/*");
  useEffect(() => {
    if (match) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [match]);
  return (
    <BottomSheet
      ref={bottomSheetRef}
      animateOnMount
      index={match ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={() => {
        if (match) {
          navigate("/app/*");
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
        <StackOrRoutes
          defaultScreenConfig={{
            stackHeaderConfig: {
              backgroundColor: "white",
              topInsetEnabled: false,
            },
          }}
        >
          <Route
            path="createPost"
            element={<Text>Type up your post here</Text>}
          />
          <Route
            path="createPost/rich"
            element={<Text>Maybe create a rich text</Text>}
          />
        </StackOrRoutes>
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
