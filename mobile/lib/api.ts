import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// Note loaclhost will work when using simulator
// but when using expo go and a physical device the production url will work
// my system ip and expo-cli connection is 192.168.215.68:8081

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useApi = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // cleanup: remove interceptor when component unmounts
    // this is for optimization purposes
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return api;
};
