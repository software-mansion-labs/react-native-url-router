import {
  Button,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, StackNavigator } from "react-native-url-router";
import { Route, useParams } from "react-router";
const videoIds = [100, 200, 300, 400, 500, 600, 700];

const Post = () => {
  const { id } = useParams();
  return (
    <Image
      source={{
        uri: `https://picsum.photos/id/${id}/400/200`,
      }}
      style={{ flex: 1 }}
    />
  );
};

export default () => {
  return (
    <StackNavigator
      defaultScreenConfig={{ stackHeaderConfig: { backgroundColor: "white" } }}
      screensConfig={{ "": { title: "Feed" }, ":id": { title: "Image" } }}
    >
      <Route
        index
        element={
          <ScrollView>
            {videoIds.map((id) => {
              return (
                <Link key={id} to={`${id}`}>
                  <View
                    key={id}
                    style={{
                      width: "100%",
                      height: 200,
                      padding: 10,
                      paddingTop: 0,
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://picsum.photos/id/${id}/400/200`,
                      }}
                      style={{
                        flex: 1,

                        backgroundColor: "red",
                      }}
                    />
                  </View>
                </Link>
              );
            })}
            <Link to="/createPost/*">
              <View
                style={{
                  backgroundColor: "#945eda",
                  margin: 10,
                  borderRadius: 5,
                  padding: 10,
                }}
              >
                <Text style={{ color: "white" }}>Post something new 🎉</Text>
              </View>
            </Link>
          </ScrollView>
        }
      />
      <Route path=":id" element={<Post />} />
    </StackNavigator>
  );
};
