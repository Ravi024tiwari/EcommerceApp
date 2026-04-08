import React, { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({ onComplete }: { onComplete: () => void }) {
  const [opacity] = useState(new Animated.Value(1));
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    // Hide the native splash screen as quickly as possible
    SplashScreen.hideAsync().then(() => {
      // Once native is hidden, start our animation
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          delay: 1500, // wait a bit before fading out
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      pointerEvents="none" // Ensure it doesn't block touches during fade out
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "#A6B0B6",
          opacity: opacity,
          zIndex: 999,
          elevation: 999, // Keep it above everything
        },
      ]}
    >
      <Animated.Image
        source={require("../assets/splashScreen.png")}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          transform: [{ scale: scale }],
        }}
      />
    </Animated.View>
  );
}
