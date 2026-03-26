import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded, userId } = useAuth();

  if (!isLoaded) return null; // for a better ux

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  // console.log("isSignedIn", isSignedIn, "userId", userId);

  return <Stack screenOptions={{ headerShown: false }} />;
}
