import { getSupabaseClient } from "@/lib/supabase";
import {
  getLocalClientIds,
  getPendingProducts,
  insertDownloadedProduct,
  markProductSynced,
} from "@/db/repositories/products";
import type { AppDatabase } from "@/db/DatabaseContext";

export type SyncResult = {
  uploaded: number;
  downloaded: number;
};

export async function syncProducts(
  userId: string,
  database: AppDatabase,
): Promise<SyncResult> {
  const supabase = getSupabaseClient();

  const { data: remoteProducts, error: downloadError } = await supabase
    .from("products")
    .select("client_id, name, quantity, price, updated_at")
    .eq("user_id", userId);
  if (downloadError) throw downloadError;

  const localClientIds = await getLocalClientIds(database);
  let downloaded = 0;
  for (const remote of remoteProducts) {
    if (localClientIds.has(remote.client_id)) continue;
    const updatedAt = new Date(remote.updated_at);
    if (Number.isNaN(updatedAt.getTime())) {
      throw new Error(
        `La fecha de actualización del producto ${remote.name} no es válida.`,
      );
    }
    await insertDownloadedProduct(database, {
      clientId: remote.client_id,
      name: remote.name,
      quantity: remote.quantity,
      price: remote.price,
      updatedAt,
      syncedAt: updatedAt,
    });
    localClientIds.add(remote.client_id);
    downloaded += 1;
  }

  const pendingProducts = await getPendingProducts(database);
  if (pendingProducts.length === 0) {
    return { uploaded: 0, downloaded };
  }

  const { error: uploadError } = await supabase.from("products").upsert(
    pendingProducts.map((product) => ({
      client_id: product.clientId,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      updated_at: product.updatedAt.toISOString(),
    })),
    { onConflict: "client_id" },
  );
  if (uploadError) throw uploadError;

  for (const product of pendingProducts) {
    await markProductSynced(database, product);
  }

  return { uploaded: pendingProducts.length, downloaded };
}
