import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, Button, Field, Notice, colors } from "@/components/AppUI";
import {
  createProduct,
  updateProduct,
} from "@/db/repositories/products";
import { useDatabase } from "@/db/DatabaseContext";
import { useProduct } from "@/hooks/useProducts";
import type { Product } from "../../db/schema";

function parseNonNegativeInteger(value: string): number | undefined {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export default function Producto() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(id) ? id[0] : id;
  const productId = rawId === undefined ? undefined : Number(rawId);
  const validProductId =
    productId !== undefined &&
    Number.isSafeInteger(productId) &&
    productId > 0;
  const { product, loading, error } = useProduct(
    validProductId ? productId : undefined,
  );

  if (rawId !== undefined && !validProductId) {
    return <ProductMessage message="El identificador del producto no es válido." />;
  }
  if (rawId !== undefined && loading) {
    return <ProductMessage message="Cargando producto..." />;
  }
  if (rawId !== undefined && error) {
    return (
      <ProductMessage message={`No se pudo cargar el producto: ${error.message}`} />
    );
  }
  if (rawId !== undefined && !product) {
    return (
      <ProductMessage message="No se encontró el producto que intentas editar." />
    );
  }

  return <ProductForm product={product} />;
}

function ProductMessage({ message }: { message: string }) {
  return (
    <AppScreen>
      <View style={styles.message}>
        <View style={styles.messageIcon}>
          <Text style={styles.messageIconText}>!</Text>
        </View>
        <Notice message={message} error={message !== "Cargando producto..."} />
        <Button label="Volver al inventario" onPress={() => router.replace("/")} />
      </View>
    </AppScreen>
  );
}

function ProductForm({ product }: { product?: Product }) {
  const database = useDatabase();
  const [name, setName] = useState(product?.name ?? "");
  const [quantity, setQuantity] = useState(
    product ? String(product.quantity) : "",
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    const trimmedName = name.trim();
    const parsedQuantity = parseNonNegativeInteger(quantity);
    const parsedPrice = parseNonNegativeInteger(price);

    if (!trimmedName) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (parsedQuantity === undefined) {
      setError("La cantidad debe ser un entero mayor o igual a 0.");
      return;
    }
    if (parsedPrice === undefined) {
      setError("El precio debe ser un entero mayor o igual a 0.");
      return;
    }

    setSaving(true);
    try {
      const input = {
        name: trimmedName,
        quantity: parsedQuantity,
        price: parsedPrice,
      };
      if (product) {
        await updateProduct(database, product, input);
      } else {
        await createProduct(database, input);
      }
      router.replace("/");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No fue posible guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen scroll>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Volver al inventario</Text>
        </Pressable>

        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <Text style={styles.headingIconText}>{product ? "✎" : "＋"}</Text>
          </View>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>INVENTARIO LOCAL</Text>
            <Text style={styles.title}>
              {product ? "Editar producto" : "Nuevo producto"}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Los cambios se guardan en este dispositivo, tengas o no internet.
        </Text>

        <View style={styles.offlineNote}>
          <View style={styles.offlineDot} />
          <Text style={styles.offlineText}>Disponible sin conexión</Text>
        </View>

        <View style={styles.formCard}>
          {error ? <Notice message={error} error /> : null}
          <Field
            label="Nombre del producto"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Arroz"
            autoCapitalize="sentences"
            returnKeyType="next"
          />
          <Field
            label="Cantidad de unidades"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            keyboardType="number-pad"
          />
          <Field
            label="Precio por unidad (pesos)"
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="number-pad"
          />

          <View style={styles.formActions}>
            <Button
              label={saving ? "Guardando..." : "Guardar producto"}
              onPress={() => void handleSave()}
              disabled={saving}
            />
            <Button
              label="Cancelar"
              onPress={() => router.back()}
              secondary
              disabled={saving}
            />
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "center", paddingVertical: 10 },
  message: { flex: 1, justifyContent: "center", paddingVertical: 24 },
  messageIcon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.warningBackground,
    borderRadius: 22,
    height: 66,
    justifyContent: "center",
    marginBottom: 16,
    width: 66,
  },
  messageIconText: { color: colors.warning, fontSize: 28, fontWeight: "800" },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    marginBottom: 23,
    minHeight: 40,
    paddingRight: 10,
  },
  backArrow: { color: colors.primary, fontSize: 30, lineHeight: 33, marginRight: 6 },
  backLabel: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  heading: { alignItems: "center", flexDirection: "row", gap: 12 },
  headingIcon: {
    alignItems: "center",
    backgroundColor: "#E5EFE5",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headingIconText: { color: colors.primary, fontSize: 23, fontWeight: "700" },
  headingCopy: { flex: 1 },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  title: { color: colors.ink, fontSize: 26, fontWeight: "800", marginTop: 4 },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 13,
    marginTop: 10,
  },
  offlineNote: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  offlineDot: {
    backgroundColor: colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  offlineText: { color: colors.success, fontSize: 11, fontWeight: "700" },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  formActions: { marginTop: 2 },
});
