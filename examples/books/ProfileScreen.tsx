import { FC } from "react";
import { Text, View } from "react-native";
import { Link } from "react-native-url-router";

const ProfileScreen: FC = () => {
  return (
    <View style={{}}>
      <Text style={{ fontSize: 20, padding: 30 }}>{"Profile"}</Text>
      <View style={{ backgroundColor: "#0f0", padding: 30 }}>
        <Text style={{ fontSize: 20 }}>
          {"You read 4 books this week! 👏"}
        </Text>
        <Text style={{ fontSize: 20 }}>
          {"3:15 spent reading a book! 👏"}
        </Text>
      </View>
      <View style={{ backgroundColor: "#f00", padding: 30 }}>
        <Text style={{ fontSize: 30, marginTop: 20 }}>
          {"Continue your 30 day streak!"}
        </Text>
        <Text style={{ fontSize: 20, marginTop: 20 }}>{"14 books read"}</Text>
      </View>
    </View>
    
  );
};
export default ProfileScreen;
