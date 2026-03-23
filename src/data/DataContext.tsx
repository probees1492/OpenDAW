import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import type { DataRepository } from "./types";
import { LocalStorageRepository } from "./LocalStorageRepository";

const RepositoryContext = createContext<DataRepository | null>(null);

export function RepositoryProvider({
  children,
  repository,
}: PropsWithChildren<{
  repository?: DataRepository;
}>) {
  const repo = useMemo(
    () => repository ?? new LocalStorageRepository(),
    [repository]
  );

  return (
    <RepositoryContext.Provider value={repo}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository(): DataRepository {
  const context = useContext(RepositoryContext);

  if (!context) {
    throw new Error("useRepository must be used within RepositoryProvider");
  }

  return context;
}
