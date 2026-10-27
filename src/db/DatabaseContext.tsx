import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "../../db/schema";

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

const DatabaseContext = createContext<AppDatabase | null>(null);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const sqliteDatabase = useSQLiteContext();
  const database = useMemo(
    () => drizzle<typeof schema>(sqliteDatabase, { schema }),
    [sqliteDatabase],
  );

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): AppDatabase {
  const database = useContext(DatabaseContext);
  if (!database) {
    throw new Error("useDatabase debe usarse dentro de DatabaseProvider.");
  }
  return database;
}
