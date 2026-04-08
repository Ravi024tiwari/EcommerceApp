import { Stack,Slot } from "expo-router";
import "../global.css"
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import {GestureHandlerRootView} from "react-native-gesture-handler"
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClerkProvider } from '@clerk/expo'

import { tokenCache } from '@clerk/expo/token-cache'
import {StripeProvider} from '@stripe/stripe-react-native'
import { useState } from "react";
import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";


export default function RootLayout() {

  const publishableKey =process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
 
const stripePublishableKey  = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!

const [isSplashComplete, setSplashComplete] = useState(false);

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <StripeProvider publishableKey={stripePublishableKey}>
        <SafeAreaView style={{flex:1}} >
            <StatusBar style="dark" />
        <CartProvider>
          <WishlistProvider>
              <Stack  screenOptions={{ headerShown:false,contentStyle:{backgroundColor:"#e5e7eb"}}}  />
              <Toast />
          </WishlistProvider>
      </CartProvider>
        </SafeAreaView>
        </StripeProvider>
      </ClerkProvider>

      {!isSplashComplete && (
        <AnimatedSplashScreen onComplete={() => setSplashComplete(true)} />
      )}
    </GestureHandlerRootView>
  )
}
