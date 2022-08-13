import { atom, useAtom, useSetAtom } from "jotai";
import { FC } from "react";
import { Button, Text, View } from "react-native";
import { NavigateIfFocused } from "react-native-url-router";

export const SessionAtom = atom(false);


const LoginScreen:FC = () => {
    const [session, setSession] = useAtom(SessionAtom);
    if (session) {
      return <NavigateIfFocused to="/root/private/book" replace />;
    }
    return (
      <View style={{ padding: 30 }}>
        <Text style={{ fontSize: 20 }}>Login screen</Text>
        <Text style={{ fontSize: 14, marginBottom:100 }}>Login using a magic button 😜</Text>
        <Button title="Login" onPress={() => setSession(true)}></Button>
      </View>
    );
}
export default LoginScreen;
