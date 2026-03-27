import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const Notfound = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // for a better ux
  if (!isSignedIn) return <Redirect href={"/(auth)"} />;

  return <Redirect href={"/(tabs)"} />;
};

export default Notfound;
