import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  NativeRouter,
  StackNavigator,
  TabNavigator,
  useSearchParams,
} from "react-native-url-router";
import { Route, useSt } from "react-router";
import React from "react";
import * as Linking from "expo-linking";
import { useEffect } from "react";

const Feed = () => {
  const params = useStaet();
  return (
    <SafeAreaView>
      <Text>Feed {JSON.stringify(params)}</Text>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <NativeRouter>
        <TabNavigator>
          <Route
            path="/test"
            element={
              <SafeAreaView>
                <Text>Root</Text>
                <LinkingHandler />
              </SafeAreaView>
            }
          />
          <Route path="/feed" element={<Feed />} />
        </TabNavigator>
      </NativeRouter>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
