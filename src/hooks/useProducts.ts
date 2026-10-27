import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { products } from "../../db/schema";
import { useDatabase } from "@/db/DatabaseContext";

export function useProducts(revision = 0) {
  const database = useDatabase();
  const result = useLiveQuery(
    database.select().from(products).orderBy(desc(products.name)),
    [database, revision],
  );

  return {
    products: result.data ?? [],
    loading: result.data === undefined && !result.error,
    error: result.error,
  };
}

export function useProduct(productId: number | undefined) {
  const database = useDatabase();
  const result = useLiveQuery(
    database
      .select()
      .from(products)
      .where(eq(products.id, productId ?? -1))
      .limit(1),
    [database, productId],
  );

  return {
    product: result.data?.[0],
    loading: result.data === undefined && !result.error,
    error: result.error,
  };
}
