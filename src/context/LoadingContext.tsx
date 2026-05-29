"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LoadingContextValue {
  isLoaded: boolean;
  onLoadingComplete: () => void;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoaded: false,
  onLoadingComplete: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoadingComplete = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoaded, onLoadingComplete }}>
      {children}
    </LoadingContext.Provider>
  );
}
