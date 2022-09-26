import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAtom } from "jotai";
import React, { FC } from "react";
import { LogBox, ScrollView, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  NativeRouter,
  NavigateIfFocused,
  StackNavigator,
  TabNavigator,
  getInitialHistoryForPath,
  Route,
} from "react-native-url-router";
import { useLocation } from "react-router";
import BookReservationModal from "./BookReservationModal";
import BookScreen from "./BookScreen";
import LoginScreen, { SessionAtom } from "./LoginScreen";
import ProfileScreen from "./ProfileScreen";

LogBox.ignoreAllLogs();

const URLBar = () => {
  const location = useLocation();
  return (
    <Text
      style={{
        padding: 10,
        paddingTop: 40,
        backgroundColor: "gray",
        width: "100%",
        textAlign: "center",
      }}
    >
      {location.pathname}
      {location.search}
    </Text>
  );
};

const PrivateRoute: FC = ({ children }) => {
  const [session, setSession] = useAtom(SessionAtom);

  if (!session) {
    return <NavigateIfFocused to="/root/login" replace />;
  }
  return <>{children}</>;
};

const booksIcon = ({ size, active }) => (
  <Text style={{ fontSize: size }}>{active ? "📕" : "📓"}</Text>
);
const profileIcon = ({ size, active }) => (
  <Text style={{ fontSize: size }}>{active ? "🌟" : "⭐️"}</Text>
);

export default function App() {
  return (
    <BottomSheetModalProvider>
      <GestureHandlerRootView style={styles.container}>
        <AppRouter />
      </GestureHandlerRootView>
    </BottomSheetModalProvider>
  );
}

const AppRouter = () => (
  <NativeRouter
    initialHistory={getInitialHistoryForPath("/root/login")}
    attachWebURLOn="/root"
  >
    <StackNavigator
      defaultScreenConfig={{ stackHeaderConfig: { hidden: true } }}
    >
      <Route path="root/login" element={<LoginScreen />} />
      <Route
        path="root/private/*"
        element={
          <PrivateRoute>
            <TabNavigator>
              <Route
                path="book"
                element={
                  <ScrollView>
                    <BookScreen />
                  </ScrollView>
                }
                title="Last read"
                icon={booksIcon}
              />
              <Route
                path="profile"
                element={<ProfileScreen />}
                title="Your profile"
                icon={profileIcon}
              />
            </TabNavigator>
          </PrivateRoute>
        }
      />
    </StackNavigator>
    <BookReservationModal />
  </NativeRouter>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
