"use client";

import dynamic from 'next/dynamic';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// 1. Cargamos el PDFViewer dinámicamente y desactivamos el SSR
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => <p>Cargando visor de PDF...</p> 
  }
);

const styles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#E4E4E4' },
  section: { margin: 10, padding: 10, flexGrow: 1 }
});

const OrderTemplatePDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
      </View>
    </Page>
  </Document>
);

export default function OrderTemplatePDFComponent() {
  return (
    <div className="w-full">
      {/* 2. Ahora el PDFViewer solo se ejecutará en el navegador */}
      <PDFViewer width="100%" height="600" showToolbar={false}>
        <OrderTemplatePDF />
      </PDFViewer>
    </div>
  );
}