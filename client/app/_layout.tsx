import { Stack } from "expo-router";
import "../global.css"
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import {GestureHandlerRootView} from "react-native-gesture-handler"
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";


export default function RootLayout() {
  return (
    <GestureHandlerRootView >
      <SafeAreaView style={{flex:1}}>
          <StatusBar style="dark" />
      <CartProvider>
        <WishlistProvider>
            <Stack  screenOptions={{ headerShown:false}} />
            <Toast />
        </WishlistProvider>
    </CartProvider>
    </SafeAreaView>
    </GestureHandlerRootView>
  )
}
