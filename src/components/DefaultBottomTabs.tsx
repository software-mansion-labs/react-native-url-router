import React from "react";
import { Text, View } from "react-native";
import Link from "./Link";
import { TabConfig } from "../navigators/TabNavigator";
import { useNestedHistoryContext } from "../routers/NativeRouter";

function DefaultBottomTabs({
  tabs,
}: {
  tabs: ({
    tabLink: string;
    active: boolean;
  } & TabConfig)[];
}) {
  const { resetPrefix } = useNestedHistoryContext();
  return (
    <View style={{ flexDirection: "row", width: "100%" }}>
      {tabs.map((tab) => (
        <View
          style={{
            flexGrow: 1,
            flexBasis: 0,
            borderTopWidth: 0.5,
            height: 70,
            borderColor: "#dadada",
          }}
          key={tab.tabLink}
        >
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link
            {...(tab.active
              ? { onPress: () => resetPrefix(tab.tabLink) }
              : { to: tab.tabLink })}
            style={{
              flexGrow: 1,
              flexBasis: 0,
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 6,
              paddingBottom: 14,
            }}
          >
            <View
              style={{
                height: 28,
                width: 28,
                backgroundColor: tab.icon ? undefined : "#ccc",
                borderRadius: tab.icon ? undefined : 4,
              }}
            >
              {tab.icon?.({
                active: tab.active,
                color: tab.active ? "#2e7df6" : "#000",
                size: 28,
              })}
            </View>

            <Text
              style={
                tab.active
                  ? { color: "#2e7df6", fontWeight: "500" }
                  : { color: "#000", fontWeight: "500" }
              }
            >
              {tab.title === undefined ? tab.tabLink : tab.title}
            </Text>
          </Link>
        </View>
      ))}
    </View>
  );
}

export default DefaultBottomTabs;
