import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

// Bu bileşen, tüm sayfaları Notchtan/Status Bar'dan koruyacak ve tam ekran yayılmasını sağlayacak.
export const ScreenContainer = ({ children }) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {children}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    // İçeriğin ekrandan taşması durumunda kaydırmaya izin verir
    flexGrow: 1, 
    paddingHorizontal: 15, // Opsiyonel: İçerik kenarlardan nefes alsın diye eklendi
  },
});