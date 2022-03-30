import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  NativeRouter,
  StackNavigator,
  TabNavigator,
  useSearchParams,
} from "react-native-url-router";
import { Route, useLocation, useNavigate } from "react-router";
import React from "react";
import * as Linking from "expo-linking";
import { useEffect } from "react";

const LinkingHandler = () => {
  console.log(
    "Open this link to see navigation from linking",
    Linking.createURL("feed", {
      queryParams: { hello: "world" },
    })
  );
  const lurl = Linking.useURL();
  const navigate = useNavigate();
  useEffect(() => {
    if (lurl) {
      const { path, queryParams } = Linking.parse(lurl);
      if (!path) return;
      const appUrl = `/${path}?${Object.entries(queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}`;
      // if you have a universal url, you can just trim the domain and pass it here
      navigate(appUrl);
    }
  }, [lurl]);
  return null;
};

const Feed = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <SafeAreaView>
      <Text>Feed</Text>
      <Text>Params {params}</Text>
      <Text>State {JSON.stringify(location.state)}</Text>
      <Button
        title="SET PARAMS"
        onPress={() => {
          setParams({ hello: "you nice person" });
        }}
      />
      <Button
        title="SET STATE"
        onPress={() => {
          navigate(location, { state: { test: 2 } });
        }}
      />
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
