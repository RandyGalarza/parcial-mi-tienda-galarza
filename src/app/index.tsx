import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { AppScreen, Button, Notice, colors } from "@/components/AppUI";
import { useAuth } from "@/context/AuthContext";
import { isProductPending, removeProduct } from "@/db/repositories/products";
import { useDatabase } from "@/db/DatabaseContext";
import { useProducts } from "@/hooks/useProducts";
import { syncProducts } from "@/services/sync";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function Index() {
  const database = useDatabase();
  const { session, signOut } = useAuth();
  const { products: inventory, loading, error } = useProducts();
  const [syncing, setSyncing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);

  const pendingCount = inventory.filter(isProductPending).length;
  const totalUnits = inventory.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = inventory.reduce(
    (sum, product) => sum + product.quantity * product.price,
    0,
  );

  async function handleSync() {
    if (!session) return;
    setSyncing(true);
    setScreenError(null);
    setMessage(null);

    try {
      const result = await syncProducts(session.user.id, database);
      setMessage(`${result.uploaded} subido(s), ${result.downloaded} bajado(s).`);
    } catch (syncError) {
      setScreenError(
        syncError instanceof Error
          ? syncError.message
          : "No fue posible sincronizar. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setSyncing(false);
    }
  }

  function confirmDelete(productId: number, productName: string) {
    const deleteProduct = () => {
      setScreenError(null);
      void removeProduct(database, productId).catch((deleteError: unknown) => {
        setScreenError(
          deleteError instanceof Error
            ? deleteError.message
            : "No fue posible eliminar el producto.",
        );
      });
    };

    if (Platform.OS === "web") {
      if (globalThis.confirm(`¿Quieres eliminar ${productName}?`)) {
        deleteProduct();
      }
      return;
    }

    Alert.alert("Eliminar producto", `¿Quieres eliminar ${productName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: deleteProduct,
      },
    ]);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setScreenError(null);
    try {
      await signOut();
      router.replace("/login");
    } catch (signOutError) {
      setScreenError(
        signOutError instanceof Error
          ? signOutError.message
          : "No fue posible cerrar la sesión.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerMark}>
            <Text style={styles.headerMarkText}>M</Text>
          </View>
          <View>
            <Text style={styles.eyebrow}>RESUMEN DE HOY</Text>
            <Text style={styles.title}>Mi tienda</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          onPress={() => void handleSignOut()}
          disabled={signingOut}
          style={styles.signOut}
        >
          <Text style={styles.signOutIcon}>↗</Text>
          <Text style={styles.signOutText}>
            {signingOut ? "Cerrando..." : "Cerrar sesión"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.valueCard}>
        <View style={styles.valueCardTop}>
          <Text style={styles.valueLabel}>VALOR DEL INVENTARIO</Text>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>COP</Text>
          </View>
        </View>
        <Text style={styles.valueAmount}>{currency.format(totalValue)}</Text>
        <Text style={styles.valueHint}>Valor estimado de todos tus productos</Text>
        <View style={styles.valueDecoration} />
        <View style={styles.valueDecorationSmall} />
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>▦</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Unidades</Text>
            <Text style={styles.statValue}>{totalUnits}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, styles.statIconAlt]}>
            <Text style={[styles.statIconText, styles.statIconTextAlt]}>▤</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Productos</Text>
            <Text style={styles.statValue}>{inventory.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.syncCard}>
        <View style={styles.syncInfo}>
          <View style={styles.syncIcon}>
            <Text style={styles.syncIconText}>↻</Text>
          </View>
          <View style={styles.syncCopy}>
            <Text style={styles.syncTitle}>
              {pendingCount === 0 ? "Todo está al día" : "Respalda tus cambios"}
            </Text>
            <Text style={styles.syncSubtitle}>
              {pendingCount === 0
                ? "No tienes cambios pendientes"
                : `${pendingCount} producto${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de subir`}
            </Text>
          </View>
        </View>
        <Button
          label={syncing ? "Subiendo..." : "Sincronizar"}
          onPress={() => void handleSync()}
          disabled={syncing}
          compact
        />
      </View>

      {message ? <Notice message={message} /> : null}
      {screenError ? <Notice message={screenError} error /> : null}
      {error ? (
        <Notice message={`No se pudo cargar el inventario: ${error.message}`} error />
      ) : null}

      <View style={styles.listHeading}>
        <View>
          <Text style={styles.sectionTitle}>Tus productos</Text>
          <Text style={styles.sectionSubtitle}>Toca uno para editar sus datos</Text>
        </View>
        <View style={styles.productCount}>
          <Text style={styles.productCountText}>{inventory.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Cargando inventario</Text>
          <Text style={styles.emptyText}>
            Un momento, estamos preparando tu lista.
          </Text>
        </View>
      ) : inventory.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>＋</Text>
          </View>
          <Text style={styles.emptyTitle}>Tu tienda empieza aquí</Text>
          <Text style={styles.emptyText}>
            Agrega tu primer producto. Se guardará en este dispositivo y podrás
            sincronizarlo después.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.productList}
          data={inventory}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const pending = isProductPending(item);
            return (
              <View style={styles.productCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.name}`}
                  onPress={() =>
                    router.push({
                      pathname: "/producto",
                      params: { id: String(item.id) },
                    })
                  }
                  style={styles.productInfo}
                >
                  <View
                    style={[
                      styles.productAvatar,
                      pending ? styles.productAvatarPending : styles.productAvatarSynced,
                    ]}
                  >
                    <Text
                      style={[
                        styles.productAvatarText,
                        pending
                          ? styles.productAvatarPendingText
                          : styles.productAvatarSyncedText,
                      ]}
                    >
                      {item.name.trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.productText}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.productDetail}>
                      {item.quantity} unidades · {currency.format(item.price)} c/u
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        pending ? styles.statusPending : styles.statusSynced,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          pending ? styles.statusPendingDot : styles.statusSyncedDot,
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          pending ? styles.statusPendingText : styles.statusSyncedText,
                        ]}
                      >
                        {pending ? "Pendiente" : "En la nube"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                <View style={styles.productActions}>
                  <View style={styles.valueTextWrap}>
                    <Text style={styles.productValueLabel}>TOTAL</Text>
                    <Text style={styles.productValue}>
                      {currency.format(item.quantity * item.price)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar ${item.name}`}
                    onPress={() => confirmDelete(item.id, item.name)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>×</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Button
          label="＋   Agregar producto"
          onPress={() => router.push("/producto")}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerBrand: { alignItems: "center", flexDirection: "row", gap: 11 },
  headerMark: {
    alignItems: "center",
    backgroundColor: "#E5EFE5",
    borderRadius: 15,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerMarkText: { color: colors.primary, fontSize: 20, fontWeight: "900" },
  signOut: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  signOutIcon: { color: colors.muted, fontSize: 17, fontWeight: "700" },
  signOutText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  valueCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 23,
    marginBottom: 13,
    minHeight: 150,
    overflow: "hidden",
    padding: 20,
  },
  valueCardTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  valueLabel: { color: "#C9D9CF", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  currencyBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  currencyText: { color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  valueAmount: { color: colors.white, fontSize: 32, fontWeight: "800", marginTop: 13 },
  valueHint: { color: "#C9D9CF", fontSize: 12, marginTop: 3 },
  valueDecoration: {
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 55,
    borderWidth: 13,
    height: 122,
    position: "absolute",
    right: -37,
    top: 57,
    width: 122,
  },
  valueDecorationSmall: {
    backgroundColor: "rgba(233,185,108,0.24)",
    borderRadius: 12,
    height: 24,
    position: "absolute",
    right: 68,
    top: 31,
    transform: [{ rotate: "28deg" }],
    width: 24,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: colors.ink, fontSize: 22, fontWeight: "800", marginTop: 2 },
  stats: { flexDirection: "row", gap: 11, marginBottom: 13 },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 75,
    padding: 12,
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: "#E9F1E8",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  statIconAlt: { backgroundColor: "#F5EEE0" },
  statIconText: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  statIconTextAlt: { color: colors.warning },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: "800", marginTop: 2 },
  syncCard: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: "#E0E9DF",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  syncInfo: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10, minWidth: 0 },
  syncIcon: {
    alignItems: "center",
    backgroundColor: "#DCE9DB",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  syncIconText: { color: colors.primary, fontSize: 21, fontWeight: "800" },
  syncCopy: { flex: 1, minWidth: 0 },
  syncTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  syncSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
  listHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 3,
  },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  productCount: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 11,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    minWidth: 34,
    paddingHorizontal: 8,
  },
  productCountText: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  listContent: { gap: 9, paddingBottom: 12 },
  productList: { flex: 1 },
  productCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 91,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  productInfo: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10, paddingRight: 8 },
  productAvatar: { alignItems: "center", borderRadius: 14, height: 44, justifyContent: "center", width: 44 },
  productAvatarPending: { backgroundColor: colors.warningBackground },
  productAvatarSynced: { backgroundColor: colors.surfaceAlt },
  productAvatarText: { fontSize: 18, fontWeight: "800" },
  productAvatarPendingText: { color: colors.warning },
  productAvatarSyncedText: { color: colors.primary },
  productText: { flex: 1, minWidth: 0 },
  productName: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  productDetail: { color: colors.muted, fontSize: 10, marginTop: 4 },
  statusPill: { alignSelf: "flex-start", alignItems: "center", borderRadius: 8, flexDirection: "row", gap: 5, marginTop: 7, paddingHorizontal: 7, paddingVertical: 4 },
  statusPending: { backgroundColor: colors.warningBackground },
  statusSynced: { backgroundColor: colors.surfaceAlt },
  statusDot: { borderRadius: 3, height: 6, width: 6 },
  statusPendingDot: { backgroundColor: colors.warning },
  statusSyncedDot: { backgroundColor: colors.success },
  statusText: { fontSize: 9, fontWeight: "800" },
  statusPendingText: { color: colors.warning },
  statusSyncedText: { color: colors.success },
  productActions: { alignItems: "flex-end", gap: 5 },
  valueTextWrap: { alignItems: "flex-end" },
  productValueLabel: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  productValue: { color: colors.ink, fontSize: 12, fontWeight: "800", marginTop: 3 },
  deleteButton: {
    alignItems: "center",
    backgroundColor: colors.dangerBackground,
    borderRadius: 9,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  deleteText: { color: colors.danger, fontSize: 21, fontWeight: "400", lineHeight: 23 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 19,
    borderWidth: 1,
    marginTop: 4,
    padding: 26,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    marginBottom: 13,
    width: 54,
  },
  emptyIconText: { color: colors.primary, fontSize: 28, fontWeight: "400" },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", textAlign: "center" },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 7, textAlign: "center" },
  footer: { backgroundColor: colors.background, paddingBottom: 6, paddingTop: 10 },
});
