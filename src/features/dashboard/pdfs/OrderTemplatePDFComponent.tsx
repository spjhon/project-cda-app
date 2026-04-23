"use client";

import { Page, Text, View, Document, StyleSheet, usePDF } from '@react-pdf/renderer';
import { ExternalLink, Loader2 } from 'lucide-react';

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

// Este es el componente interno que usa el hook problemático
function PDFGeneratorView() {
  const [instance] = usePDF({ document: <OrderTemplatePDF /> });

  if (instance.error) return <div className="text-red-500">Error: {instance.error}</div>;

  return (
    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center w-full max-w-md">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Documento Listo</h3>
      <p className="text-slate-500 text-sm text-center mb-6">
        Haz clic abajo para visualizar la orden en una ventana independiente.
      </p>

      {instance.loading ? (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="animate-spin h-5 w-5" />
          <span>Generando PDF...</span>
        </div>
      ) : (
        <button
          onClick={() => {
            if (instance.url) window.open(instance.url, '_blank');
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-95"
        >
          <ExternalLink className="w-5 h-5" />
          Ver en pestaña nueva
        </button>
      )}
    </div>
  );
}

// 2. Exportamos el componente usando el IMPORT DINÁMICO para evitar el error de SSR
import dynamic from 'next/dynamic';

export default dynamic(() => Promise.resolve(PDFGeneratorView), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 p-10">
      <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
      <p className="text-slate-500">Preparando generador...</p>
    </div>
  ),
});