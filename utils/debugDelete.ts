import AsyncStorage from "@react-native-async-storage/async-storage";

interface DeleteDebugOptions {
  storageKey: string;
  itemId: string;
  idField?: string;
  entityName?: string;
}

/**
 * Advanced delete debugging utility
 * Comprehensive logging untuk filter, type matching, storage operations
 */
export const debugDeleteOperation = async <T extends { id: string }>(
  options: DeleteDebugOptions
): Promise<{ success: boolean; before: number; after: number; data: T[] }> => {
  const { storageKey, itemId, idField = "id", entityName = "Item" } = options;

  console.log(`\n🎯 === ${entityName.toUpperCase()} DELETE DEBUG ===`);
  console.log(`📌 Silinecek ID: "${itemId}" (${typeof itemId})`);

  try {
    // STEP 1: Load
    console.log(`\n📦 STEP 1: AsyncStorage'dan oku`);
    const stored = await AsyncStorage.getItem(storageKey);
    const items: T[] = stored ? JSON.parse(stored) : [];
    console.log(`   ✅ Okunan item sayısı: ${items.length}`);

    // STEP 2: ID Matching Debug
    console.log(`\n🔍 STEP 2: ID eşleşme analizi`);
    const matchAnalysis = items.map((item, idx) => {
      const itemIdStr = String((item as any)[idField]);
      const searchIdStr = String(itemId);
      const match = itemIdStr === searchIdStr;
      console.log(
        `   [${idx}] "${itemIdStr}" === "${searchIdStr}" ? ${match ? "✅ MATCH" : "❌ NO"}`
      );
      return { idx, itemId: itemIdStr, match };
    });

    // STEP 3: Filter
    console.log(`\n❌ STEP 3: Filter işlemi`);
    const newItems = items.filter((item) => String((item as any)[idField]) !== String(itemId));
    const deletedCount = items.length - newItems.length;
    console.log(`   Silinen: ${items.length} → ${newItems.length} (${deletedCount} deleted)`);

    if (deletedCount === 0) {
      console.error(`   ⚠️ UYARI: Hiçbir item silinmedi!`);
    } else {
      console.log(`   ✅ ${deletedCount} item başarıyla filtrelendi`);
    }

    // STEP 4: Storage Write
    console.log(`\n💾 STEP 4: AsyncStorage'a yaz`);
    const jsonData = JSON.stringify(newItems);
    console.log(`   JSON size: ${jsonData.length} bytes`);

    await AsyncStorage.setItem(storageKey, jsonData);
    console.log(`   ✅ AsyncStorage.setItem() başarılı`);

    // STEP 5: Verify
    console.log(`\n🔐 STEP 5: Doğrulama (double-check)`);
    const verify = await AsyncStorage.getItem(storageKey);
    const verifyItems: T[] = verify ? JSON.parse(verify) : [];
    const stillExists = verifyItems.some((item) => String((item as any)[idField]) === String(itemId));

    console.log(`   Verify item count: ${verifyItems.length}`);
    console.log(`   Silinen item hâlâ mevcut mu? ${stillExists ? "❌ HATA!" : "✅ Tamam"}`);

    if (stillExists) {
      console.error(`   ❌ KRITIK: Item delete başarısız!`);
    }

    console.log(`\n✅ === DELETE İŞLEMİ TAMAMLANDI ===\n`);

    return {
      success: deletedCount > 0 && !stillExists,
      before: items.length,
      after: newItems.length,
      data: newItems,
    };
  } catch (error) {
    console.error(`\n💥 === DELETE HATA ===`);
    console.error(`   ${error}`);
    return {
      success: false,
      before: 0,
      after: 0,
      data: [],
    };
  }
};
