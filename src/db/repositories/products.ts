import * as Crypto from "expo-crypto";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import type { AppDatabase } from "@/db/DatabaseContext";
import {
  products,
  type Product,
  type ProductInput,
} from "../../../db/schema";

function validateInput(input: ProductInput): void {
  if (!input.name.trim()) {
    throw new Error("El nombre del producto es obligatorio.");
  }
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 0) {
    throw new Error("La cantidad debe ser un entero mayor o igual a 0.");
  }
  if (!Number.isSafeInteger(input.price) || input.price < 0) {
    throw new Error("El precio debe ser un entero mayor o igual a 0.");
  }
}

function nextUpdatedAt(product?: Product): Date {
  const previous = Math.max(
    product?.updatedAt.getTime() ?? 0,
    product?.syncedAt?.getTime() ?? 0,
  );
  return new Date(Math.max(Date.now(), previous + 1));
}

export function isProductPending(product: Product): boolean {
  return (
    product.syncedAt === null ||
    product.syncedAt.getTime() < product.updatedAt.getTime()
  );
}

export async function createProduct(
  database: AppDatabase,
  input: ProductInput,
): Promise<void> {
  validateInput(input);
  await database
    .insert(products)
    .values({
      clientId: Crypto.randomUUID(),
      name: input.name.trim(),
      quantity: input.quantity,
      price: input.price,
      updatedAt: nextUpdatedAt(),
    })
    .run();
}

export async function updateProduct(
  database: AppDatabase,
  product: Product,
  input: ProductInput,
): Promise<void> {
  validateInput(input);
  await database
    .update(products)
    .set({
      name: input.name.trim(),
      quantity: input.quantity,
      price: input.price,
      updatedAt: nextUpdatedAt(product),
    })
    .where(eq(products.id, product.id))
    .run();
}

export async function removeProduct(
  database: AppDatabase,
  productId: number,
): Promise<void> {
  await database.delete(products).where(eq(products.id, productId)).run();
}

export async function getPendingProducts(
  database: AppDatabase,
): Promise<Product[]> {
  return database
    .select()
    .from(products)
    .where(or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt)));
}

export async function getLocalClientIds(database: AppDatabase): Promise<Set<string>> {
  const rows = await database.select({ clientId: products.clientId }).from(products);
  return new Set(rows.map((row) => row.clientId));
}

export async function insertDownloadedProduct(
  database: AppDatabase,
  input: Omit<Product, "id">,
): Promise<void> {
  await database
    .insert(products)
    .values(input)
    .onConflictDoNothing({ target: products.clientId })
    .run();
}

export async function markProductSynced(
  database: AppDatabase,
  product: Product,
): Promise<void> {
  await database
    .update(products)
    .set({ syncedAt: product.updatedAt })
    .where(
      and(
        eq(products.id, product.id),
        eq(products.updatedAt, product.updatedAt),
      ),
    )
    .run();
}
