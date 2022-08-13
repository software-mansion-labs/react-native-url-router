import { FC } from "react";
import { Text, View } from "react-native";
import { Link } from "react-native-url-router";

const BookScreen: FC = () => {
  return (
    <View style={{ padding: 30 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        {"Last read book:"}
      </Text>
      <View
        style={{
          backgroundColor: "#22f",
          borderRadius: 5,
          padding: 20,
          width: 300,
          height: 400,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 7,
          },
          shadowOpacity: 0.43,
          shadowRadius: 9.51,

          elevation: 15,
        }}
      >
        <Text style={{ fontSize: 50, marginBottom: 40, color: "white",textAlign:"center",  }}>
          {"Odyssey"}
        </Text>
        <Text style={{ fontSize: 150, textAlign:"center", marginBottom:50 }}>
          {"⚓️"}
        </Text>
        <Text style={{ fontSize: 20, color: "white" }}>{"Homer"}</Text>
      </View>
      <Link to="/modal/book">
        <View
          style={{
            marginTop: 50,
            backgroundColor: "#22f",
            borderRadius: 300,
            padding: 12,
            width: 200,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
            }}
          >
            {"Continue reading"}
          </Text>
        </View>
      </Link>
    </View>
  );
};
export default BookScreen;
