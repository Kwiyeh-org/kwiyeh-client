 // app/index.tsx
import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/user-type");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
