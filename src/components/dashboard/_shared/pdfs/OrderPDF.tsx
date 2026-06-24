"use client";

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { FetchEntryOrderResult, TirePressureDetail } from '@/lib/client-actions/fetch_entry_order_by_id';
import {  OrderTemplate as OrderTemplateType } from "@/lib/server-actions/fetch_orders_templates";

// ============================================================
// ESTILOS POR SECCIÓN
// ============================================================

// --------------------------------------------------
// 1. ESTILOS GLOBALES DE PÁGINA
// --------------------------------------------------
const pageStyles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
});

// --------------------------------------------------
// 2. ESTILOS DEL ENCABEZADO
// --------------------------------------------------
const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    height: 65,
    marginBottom: 15,
  },
  logoSection: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  logoFallback: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
  },
  titleSection: {
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    textTransform: 'uppercase',
  },
  metaSection: {
    width: '30%',
    borderLeftWidth: 1,
    borderLeftColor: '#cbd5e1',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  metaRowLast: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#e0e7ff',
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#475569',
    width: '45%',
  },
  metaValue: {
    fontSize: 7.5,
    color: '#0f172a',
    width: '55%',
  },
  consecutivoText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
});

// --------------------------------------------------
// 3. ESTILOS DE SECCIONES GENERALES (GRID)
// --------------------------------------------------
const sectionStyles = StyleSheet.create({
  sectionContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  gridRowLast: {
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  gridCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  cellLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    width: '40%',
  },
  cellValue: {
    fontSize: 8,
    color: '#0f172a',
    width: '60%',
    textAlign: 'center',
  },
  badgeReinspeccion: {
    fontSize: 7.5,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  placaBox: {
    backgroundColor: '#fef08a',
    borderWidth: 1,
    borderColor: '#eab308',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#713f12',
    textAlign: 'center',
  },
  textCapitalize: {
    textTransform: 'capitalize',
  },
});

// --------------------------------------------------
// 4. ESTILOS DE TABLA DE PRESIONES
// --------------------------------------------------
const pressureStyles = StyleSheet.create({
  tableHeader: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 4,
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  colEje: { width: '15%' },
  colPos: { width: '35%' },
  colPres: { width: '25%' },
  tableCell: {
    fontSize: 8,
    color: '#0f172a',
    textAlign: 'center',
  },
  emptyMessage: {
    padding: 10,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

// --------------------------------------------------
// 5. ESTILOS DE TABLA DE CONDICIONES
// --------------------------------------------------
const conditionStyles = StyleSheet.create({
  cond_tableHeader: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 5,
  },
  cond_tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  cond_tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 5,
    alignItems: 'center',
  },
  cond_tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  cond_colLabel: {
    width: '75%',
    paddingLeft: 8,
  },
  cond_colValue: {
    width: '25%',
  },
  cond_textLabel: {
    fontSize: 8,
    color: '#0f172a',
  },
  cond_textSpecialLabel: {
    fontSize: 7.5,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 2,
  },
  badgeCumple: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#15803d',
    textAlign: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 2,
    marginHorizontal: 15,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#bbf7d0',
    textTransform: 'uppercase',
  },
  badgeNoAplica: {
    fontSize: 7.5,
    fontWeight: 'normal',
    color: '#64748b',
    textAlign: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    marginHorizontal: 15,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    textTransform: 'uppercase',
  },
  emptyConditions: {
    padding: 12,
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
});

// --------------------------------------------------
// 6. ESTILOS DE OBSERVACIONES
// --------------------------------------------------
const observationStyles = StyleSheet.create({
  observacionesContainer: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#64748b',
    borderRadius: 4,
    marginTop: 2,
  },
  observacionesText: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.4,
  },
  observacionesVacias: {
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 4,
  },
});

// --------------------------------------------------
// 7. ESTILOS DE CONTRATO
// --------------------------------------------------
const contractStyles = StyleSheet.create({
  contratoContainer: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#fafafa',
    marginTop: 2,
  },
  contratoText: {
    fontSize: 6.5,
    color: '#475569',
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  contratoVacio: {
    fontSize: 7.5,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 6,
  },
});

// --------------------------------------------------
// 8. ESTILOS DE FIRMA E INSPECTOR
// --------------------------------------------------
const inspectorStyles = StyleSheet.create({
  inspectorSectionContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  inspectorSectionHeader: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  inspectorSectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inspectorTableCard: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  inspectorTableHeader: {
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  inspectorHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  inspectorTableBody: {
    flexDirection: 'row',
    width: '100%',
  },
  inspectorColumn: {
    padding: 10,
    flexDirection: 'column',
  },
  inspectorColumnSignature: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    alignItems: 'center',
  },
  inspectorColumnInfo: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    justifyContent: 'center',
  },
  inspectorColumnLegal: {
    width: '30%',
    justifyContent: 'center',
  },
  signatureWrapper: {
    width: '100%',
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  emptyText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: '#94a3b8',
  },
  infoBlock: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: '#94a3b8',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  legalText: {
    fontSize: 6,
    fontFamily: 'Helvetica',
    color: '#64748b',
    lineHeight: 1.2,
  },
  inspectorFooterRow: {
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inspectorFooterText: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Oblique',
    color: '#94a3b8',
    textAlign: 'center',
  },
});





// --------------------------------------------------
// 09. ESTILOS DE DATOS DEL PROPIETARIO
// --------------------------------------------------
const ownerStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 8,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gridRowLast: {
    flexDirection: 'row',
  },
  labelCell: {
    width: '35%',
  },
  valueCell: {
    width: '65%',
  },
  label: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748b',
  },
  value: {
    fontSize: 8,
    color: '#0f172a',
    fontWeight: 'medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 6,
  },
});

// --------------------------------------------------
// 10. ESTILOS DE DATOS DEL CLIENTE
// --------------------------------------------------
const clientStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 8,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gridRowLast: {
    flexDirection: 'row',
  },
  labelCell: {
    width: '35%',
  },
  valueCell: {
    width: '65%',
  },
  label: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748b',
  },
  value: {
    fontSize: 8,
    color: '#0f172a',
    fontWeight: 'medium',
  },
  sameAsOwnerBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sameAsOwnerText: {
    fontSize: 6.5,
    color: '#15803d',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 6,
  },
});







// --------------------------------------------------
// 11. ESTILOS DE FIRMAS COMPLEMENTARIAS (CLIENTES/OTROS)
// --------------------------------------------------
const complementaryStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureItem: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  signatureItemLast: {
    marginBottom: 0,
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  representativeType: {
    fontSize: 7,
    color: '#64748b',
    fontStyle: 'italic',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  signatureImage: {
    width: 150,
    height: 50,
    objectFit: 'contain',
  },
  noSignatureText: {
    fontSize: 7,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  declarationsContainer: {
    padding: 8,
    backgroundColor: '#ffffff',
  },
  declarationsTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  declarationRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  bulletPoint: {
    fontSize: 7,
    color: '#4f46e5',
    width: 12,
  },
  declarationText: {
    fontSize: 7,
    color: '#334155',
    flex: 1,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  emptyDeclarations: {
    fontSize: 7,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 6,
  },
});



// --------------------------------------------------
// 12. ESTILOS DEL PIE DE PÁGINA
// --------------------------------------------------
const footerStyles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 6,
  },
  footerLeft: {
    fontSize: 7,
    color: '#94a3b8',
  },
  footerCenter: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footerRight: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'right',
  },
});


// --------------------------------------------------
// 13. seccion anulado
// --------------------------------------------------
const voidedStyles = StyleSheet.create({
  voidedBanner: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voidedBannerText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  voidedBannerSubtext: {
    fontSize: 8,
    color: '#fecaca',
    marginTop: 2,
    fontFamily: 'Helvetica-Oblique',
  },
});


// --------------------------------------------------
// 14. Firma del dt
// --------------------------------------------------

const directorStyles = StyleSheet.create({
  directorSectionContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  directorSectionHeader: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  directorSectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  directorTableCard: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  directorTableHeader: {
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  directorHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  directorTableBody: {
    flexDirection: 'row',
    width: '100%',
  },
  directorColumn: {
    padding: 10,
    flexDirection: 'column',
  },
  directorColumnSignature: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    alignItems: 'center',
  },
  directorColumnInfo: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    justifyContent: 'center',
  },
  directorColumnLegal: {
    width: '30%',
    justifyContent: 'center',
  },
  signatureWrapper: {
    width: '100%',
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  emptyText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: '#94a3b8',
  },
  infoBlock: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: '#94a3b8',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  legalText: {
    fontSize: 6,
    fontFamily: 'Helvetica',
    color: '#64748b',
    lineHeight: 1.2,
  },
  directorFooterRow: {
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  directorFooterText: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Oblique',
    color: '#94a3b8',
    textAlign: 'center',
  },
});


// ============================================================
// INTERFACES
// ============================================================
interface OrderPDFProps {
  
  orderData?: FetchEntryOrderResult;
  templateData?: OrderTemplateType;
 
}

// ============================================================
// SUB-COMPONENTES (declarados FUERA del componente principal)
// ============================================================

// --------------------------------------------------
// 1. ENCABEZADO
// --------------------------------------------------
function HeaderSection({ orderData, templateData }: {
 
  orderData?: FetchEntryOrderResult;
  fechaDoc: string;
  templateData: OrderTemplateType | undefined;
}) {


  const logoSrc = orderData?.plantilla_logo_url || templateData?.logo_url;


  return (
    <View style={headerStyles.headerContainer}>
          <View style={headerStyles.logoSection}>
      {logoSrc ? (
        <Image src={logoSrc} style={headerStyles.logo} />
      ) : (
        <Text style={headerStyles.logoFallback}>TU LOGO</Text>
      )}
    </View>

      <View style={headerStyles.titleSection}>
        <Text style={headerStyles.documentTitle}>
          {orderData?.plantilla_nombre || 'Orden de Ingreso Vehicular'}
        </Text>
      </View>

      <View style={headerStyles.metaSection}>
        <View style={headerStyles.metaRow}>
          <Text style={headerStyles.metaLabel}>Código:</Text>
          <Text style={headerStyles.metaValue}>
            {orderData?.plantilla_codigo_documento || templateData?.document_code || 'N/A'}
          </Text>
        </View>
        <View style={headerStyles.metaRow}>
          <Text style={headerStyles.metaLabel}>Versión:</Text>
          <Text style={headerStyles.metaValue}>
            {orderData?.plantilla_version || templateData?.version || 'N/A'}
          </Text>
        </View>
        <View style={headerStyles.metaRow}>
          <Text style={headerStyles.metaLabel}>Fecha Doc:</Text>
          <Text style={headerStyles.metaValue}>{orderData?.plantilla_fecha_documento??templateData?.document_date}</Text>
        </View>
        <View style={headerStyles.metaRowLast}>
          <Text style={[headerStyles.metaLabel, { color: '#312e81' }]}>
            N° Orden:
          </Text>
          <Text style={[headerStyles.metaValue, headerStyles.consecutivoText]}>
            {orderData?.consecutivo || '0000'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// 2. INFORMACIÓN GENERAL
// --------------------------------------------------
function GeneralInfoSection({ orderData, fechaEntrada }: {
  orderData: FetchEntryOrderResult | undefined;
  fechaEntrada: string;
}) {
  const formatServiceType = (type: string) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          1. Información General del Ingreso
        </Text>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Fecha Entrada:</Text>
          <Text style={sectionStyles.cellValue}>{fechaEntrada}</Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Tipo Servicio:</Text>
          <Text style={[sectionStyles.cellValue, { fontWeight: 'medium' }]}>
            {formatServiceType(orderData?.service_type || "")}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRowLast}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>¿Reinspección?:</Text>
          {orderData?.es_reinspeccion ? (
            <Text
              style={[
                sectionStyles.cellValue,
                sectionStyles.badgeReinspeccion,
                { color: '#b45309', backgroundColor: '#fef3c7' },
              ]}
            >
              SÍ (Segunda revisión)
            </Text>
          ) : (
            <Text style={[sectionStyles.cellValue, { color: '#475569' }]}>
              NO (Primera vez)
            </Text>
          )}
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}></Text>
          <Text style={sectionStyles.cellValue}></Text>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// 3. DATOS DEL VEHÍCULO
// --------------------------------------------------
function VehicleSection({ orderData }: { orderData: FetchEntryOrderResult | undefined}) {
  const formatFechaSnapshot = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          2. Identificación del Vehículo y Documentos
        </Text>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Placa:</Text>
          <View style={{ width: '60%', alignItems: 'flex-start' }}>
            <Text style={sectionStyles.placaBox}>
              {orderData?.vehiculo_placa
                ? orderData.vehiculo_placa.toUpperCase()
                : 'N/A'}
            </Text>
          </View>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Tipo Vehículo:</Text>
          <Text style={[sectionStyles.cellValue, sectionStyles.textCapitalize]}>
            {orderData?.vehiculo_tipo_vehiculo?.replace(/_/g, ' ') || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Marca:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_marca || 'N/A'}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Línea:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_linea || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Modelo:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_modelo || 'N/A'}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Color:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_color || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Clase:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_clase || 'N/A'}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Clase Servicio:</Text>
          <Text style={[sectionStyles.cellValue, sectionStyles.textCapitalize]}>
            {orderData?.vehiculo_tipo_servicio_vehiculo || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Combustible:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_combustible || 'N/A'}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Cilindrada:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_cilindrada
              ? `${orderData.vehiculo_cilindrada} c.c.`
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Capacidad Pas.:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_capacidad_pasajeros || 'N/A'}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>Kilometraje Act:</Text>
          <Text style={[sectionStyles.cellValue, { fontWeight: 'bold' }]}>
            {orderData?.kilometraje ? `${orderData.kilometraje} Km` : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Vence SOAT:</Text>
          <Text style={sectionStyles.cellValue}>
            {formatFechaSnapshot(orderData?.soat_vencimiento_snapshot ?? undefined)}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>N° Cert. Gas:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.gas_numero_snapshot || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRow}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>Vence Gas:</Text>
          <Text style={sectionStyles.cellValue}>
            {formatFechaSnapshot(orderData?.gas_vencimiento_snapshot ?? undefined)}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>¿Es Blindado?:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_blindaje ? 'SÍ (Posee Blindaje)' : 'NO'}
          </Text>
        </View>
      </View>

      <View style={sectionStyles.gridRowLast}>
        <View style={[sectionStyles.gridCell, sectionStyles.gridCellBorderRight]}>
          <Text style={sectionStyles.cellLabel}>¿Enseñanza?:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_es_ensenanza
              ? 'SÍ (Escuela automovilística)'
              : 'NO'}
          </Text>
        </View>
        <View style={sectionStyles.gridCell}>
          <Text style={sectionStyles.cellLabel}>¿Es Extranjero?:</Text>
          <Text style={sectionStyles.cellValue}>
            {orderData?.vehiculo_es_extranjero
              ? 'SÍ (Placa fuera del país)'
              : 'NO'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// 4. PRESIONES DE NEUMÁTICOS
// --------------------------------------------------
function PressureSection({ orderData }: { orderData: FetchEntryOrderResult | undefined }) {
  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          3. Control de Presión de Neumáticos (PSI)
        </Text>
      </View>

      <View style={pressureStyles.tableHeader}>
        <View style={pressureStyles.colEje}>
          <Text style={pressureStyles.tableHeaderText}>Eje</Text>
        </View>
        <View style={pressureStyles.colPos}>
          <Text style={pressureStyles.tableHeaderText}>Posición</Text>
        </View>
        <View style={pressureStyles.colPres}>
          <Text style={pressureStyles.tableHeaderText}>Encontrada</Text>
        </View>
        <View style={pressureStyles.colPres}>
          <Text style={pressureStyles.tableHeaderText}>Ajustada</Text>
        </View>
      </View>

      {orderData?.presiones_llantas && orderData.presiones_llantas.length > 0 ? (
        orderData.presiones_llantas.map((tp: TirePressureDetail, index: number) => {
          const isLast = index === (orderData?.presiones_llantas?.length || 0) - 1;
          return (
            <View
              key={index}
              style={isLast ? pressureStyles.tableRowLast : pressureStyles.tableRow}
            >
              <View style={pressureStyles.colEje}>
                <Text style={pressureStyles.tableCell}>{tp.eje}</Text>
              </View>
              <View style={pressureStyles.colPos}>
                <Text
                  style={[pressureStyles.tableCell, sectionStyles.textCapitalize]}
                >
                  {tp.posicion.replace(/_/g, ' ')}
                </Text>
              </View>
              <View style={pressureStyles.colPres}>
                <Text style={[pressureStyles.tableCell, { fontWeight: 'bold' }]}>
                  {tp.encontrada ?? '-'}
                </Text>
              </View>
              <View style={pressureStyles.colPres}>
                <Text
                  style={[
                    pressureStyles.tableCell,
                    { color: '#059669', fontWeight: 'bold' },
                  ]}
                >
                  {tp.ajustada ?? '-'}
                </Text>
              </View>
            </View>
          );
        })
      ) : (
        <View>
          <Text style={pressureStyles.emptyMessage}>
            No se registraron mediciones de presión.
          </Text>
        </View>
      )}
    </View>
  );
}




// --------------------------------------------------
// 5. CONDICIONES DE INSPECCIÓN
// --------------------------------------------------
function ConditionsSection({ orderData, templateData }: {
 
  orderData?: FetchEntryOrderResult;
  templateData?: OrderTemplateType;
}) {

const conditions = orderData?.condiciones_plantilla || templateData?.conditions



  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          4. Verificación de Condiciones Especiales y de Control
        </Text>
      </View>

      <View style={conditionStyles.cond_tableHeader}>
        <View style={conditionStyles.cond_colLabel}>
          <Text style={conditionStyles.cond_tableHeaderText}>
            Condición Evaluada
          </Text>
        </View>
        <View style={conditionStyles.cond_colValue}>
          <Text
            style={[
              conditionStyles.cond_tableHeaderText,
              { textAlign: 'center' },
            ]}
          >
            Resultado
          </Text>
        </View>
      </View>

      {conditions && conditions.length > 0 ? (
        conditions.map((cond, index: number) => {
          const isLast = index === (orderData?.condiciones_plantilla?.length || 0) - 1;
          return (
            <View
              key={cond.id || index}
              style={
                isLast
                  ? conditionStyles.cond_tableRowLast
                  : conditionStyles.cond_tableRow
              }
            >
              <View style={conditionStyles.cond_colLabel}>
                <Text style={conditionStyles.cond_textLabel}>{cond.label}</Text>
                {cond.is_special && cond.special_condition_label && (
                  <Text style={conditionStyles.cond_textSpecialLabel}>
                    Nota: {cond.special_condition_label}
                  </Text>
                )}
              </View>

              <View style={conditionStyles.cond_colValue}>
                {cond.default_value === 'cumple' ? (
                  <Text style={conditionStyles.badgeCumple}>Cumple</Text>
                ) : (
                  <Text style={conditionStyles.badgeNoAplica}>No Aplica</Text>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <View>
          <Text style={conditionStyles.emptyConditions}>
            No hay condiciones configuradas para esta plantilla de inspección.
          </Text>
        </View>
      )}
    </View>
  );
}







// --------------------------------------------------
// 6. OBSERVACIONES
// --------------------------------------------------
function ObservationsSection({ orderData }: { orderData: FetchEntryOrderResult | undefined }) {
  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          5. Observaciones / Novedades de la Orden
        </Text>
      </View>

      {orderData?.observaciones && orderData.observaciones.trim() !== '' ? (
        <View style={observationStyles.observacionesContainer}>
          <Text style={observationStyles.observacionesText}>
            {orderData.observaciones}
          </Text>
        </View>
      ) : (
        <View style={observationStyles.observacionesContainer}>
          <Text style={observationStyles.observacionesVacias}>
            No se registraron observaciones ni novedades durante el ingreso del
            vehículo.
          </Text>
        </View>
      )}
    </View>
  );
}

// --------------------------------------------------
// 7. TÉRMINOS CONTRACTUALES
// --------------------------------------------------
function ContractSection({ orderData, templateData }: {
 
  orderData?: FetchEntryOrderResult;
 
  templateData?: OrderTemplateType;
}) {

const textoContractual = orderData?.plantilla_texto_contractual || templateData?.base_contract_text;

  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          6. Declaración y Clausulado Contractual
        </Text>
      </View>

      {typeof textoContractual === 'string' && textoContractual.trim() !== '' ? (
  <View style={contractStyles.contratoContainer}>
    <Text style={contractStyles.contratoText}>
      {textoContractual}
    </Text>
  </View>
) : (
  <View style={contractStyles.contratoContainer}>
    <Text style={contractStyles.contratoVacio}>
      No se constatan cláusulas contractuales específicas anexas a esta orden
      de entrada.
    </Text>
  </View>
)}
    </View>
  );
}
// --------------------------------------------------
// 8. FIRMA E INSPECTOR
// --------------------------------------------------
function InspectorSection({
  orderData,
}: {
  orderData: FetchEntryOrderResult | undefined;
}) {
  return (
    <View style={inspectorStyles.inspectorSectionContainer}>
      <View style={inspectorStyles.inspectorSectionHeader}>
        <Text style={inspectorStyles.inspectorSectionTitle}>
          7. Recepcionista Responsable
        </Text>
      </View>

      <View style={inspectorStyles.inspectorTableCard}>
        <View style={inspectorStyles.inspectorTableHeader}>
          <Text style={inspectorStyles.inspectorHeaderText}>
            Datos y Reconocimiento del Recepcionista Responsable
          </Text>
        </View>

        <View style={inspectorStyles.inspectorTableBody}>
          {/* COLUMNA 1: FIRMA */}
          <View
            style={[
              inspectorStyles.inspectorColumn,
              inspectorStyles.inspectorColumnSignature,
            ]}
          >
            <Text style={inspectorStyles.infoLabel}>
              FIRMA DIGITALIZADA
            </Text>

            <View style={inspectorStyles.signatureWrapper}>
              {orderData?.funcionario_firma ? (
                <Image
                  src={orderData.funcionario_firma} // Si ya entró al 'if', TS sabe que es un string válido
                  style={inspectorStyles.signatureImage}
                />
              ) : (
                <Text style={inspectorStyles.emptyText}>
                  Firma No Registrada
                </Text>
              )}
            </View>
          </View>

          {/* COLUMNA 2: DATOS DEL FUNCIONARIO */}
          <View
            style={[
              inspectorStyles.inspectorColumn,
              inspectorStyles.inspectorColumnInfo,
            ]}
          >
            <View style={inspectorStyles.infoBlock}>
              <Text style={inspectorStyles.infoLabel}>
                NOMBRE COMPLETO DEL RESPONSABLE
              </Text>

              <Text style={inspectorStyles.infoValue}>
                {orderData?.funcionario_nombre || 'N/A'}
              </Text>
            </View>

            <View
              style={[
                inspectorStyles.infoBlock,
                { marginTop: 8 },
              ]}
            >
              <Text style={inspectorStyles.infoLabel}>
                DOCUMENTO DE IDENTIFICACIÓN
              </Text>

              <Text style={inspectorStyles.infoValue}>
                CC:
                {" "}
                {orderData?.funcionario_documento || 'N/A'}
              </Text>
            </View>
          </View>

          {/* COLUMNA 3: DECLARACIÓN */}
          <View
            style={[
              inspectorStyles.inspectorColumn,
              inspectorStyles.inspectorColumnLegal,
            ]}
          >
            <Text style={inspectorStyles.infoLabel}>
              ROL OPERATIVO
            </Text>

            <Text
              style={[
                inspectorStyles.infoValue,
                {
                  color: '#2563eb',
                  marginBottom: 6,
                },
              ]}
            >
              RECEPCIONISTA
            </Text>

            <Text style={inspectorStyles.legalText}>
              El presente funcionario certifica que la
              información registrada en la presente orden de
              entrada fue validada y almacenada conforme a los
              procedimientos internos del Centro de Diagnóstico
              Automotor.
            </Text>
          </View>
        </View>

        <View style={inspectorStyles.inspectorFooterRow}>
          <Text style={inspectorStyles.inspectorFooterText}>
            Registro de auditoría interna - Documento digitalizado
            de uso exclusivo para procesos de control vehicular.
          </Text>
        </View>
      </View>
    </View>
  );
}






// --------------------------------------------------
// 09. DATOS DEL PROPIETARIO DEL VEHÍCULO
// --------------------------------------------------
function OwnerSection({ orderData }: { orderData: FetchEntryOrderResult | undefined }) {
  const formatDocumentType = (type: string) => {
    if (!type) return 'N/A';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <View style={ownerStyles.container}>
      <View style={ownerStyles.header}>
        <Text style={ownerStyles.headerTitle}>
          08. Datos del Propietario del Vehículo
        </Text>
      </View>

      <View style={ownerStyles.content}>
        <View style={ownerStyles.gridRow}>
          <View style={ownerStyles.labelCell}>
            <Text style={ownerStyles.label}>Nombre Completo:</Text>
          </View>
          <View style={ownerStyles.valueCell}>
            <Text style={ownerStyles.value}>
              {orderData?.propietario_nombre || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={ownerStyles.gridRow}>
          <View style={ownerStyles.labelCell}>
            <Text style={ownerStyles.label}>Tipo de Documento:</Text>
          </View>
          <View style={ownerStyles.valueCell}>
            <Text style={ownerStyles.value}>
              {formatDocumentType(orderData?.propietario_tipo_documento || "")}
            </Text>
          </View>
        </View>

        <View style={ownerStyles.gridRowLast}>
          <View style={ownerStyles.labelCell}>
            <Text style={ownerStyles.label}>Número de Documento:</Text>
          </View>
          <View style={ownerStyles.valueCell}>
            <Text style={ownerStyles.value}>
              {orderData?.propietario_documento || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}


// --------------------------------------------------
// 10. DATOS DEL CLIENTE QUE REALIZA EL TRÁMITE
// --------------------------------------------------
function ClientSection({ orderData }: { orderData: FetchEntryOrderResult | undefined}) {
  const formatDocumentType = (type: string) => {
    if (!type) return 'N/A';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isSameAsOwner = () => {
    return orderData?.propietario_documento === orderData?.cliente_documento &&
           orderData?.propietario_tipo_documento === orderData?.cliente_tipo_documento;
  };

  const sameAsOwner = isSameAsOwner();

  return (
    <View style={clientStyles.container}>
      <View style={clientStyles.header}>
        <Text style={clientStyles.headerTitle}>
          09. Datos del Cliente que Realiza el Trámite
        </Text>
      </View>

      <View style={clientStyles.content}>
        <View style={clientStyles.gridRow}>
          <View style={clientStyles.labelCell}>
            <Text style={clientStyles.label}>Nombre Completo:</Text>
          </View>
          <View style={clientStyles.valueCell}>
            <Text style={clientStyles.value}>
              {orderData?.cliente_nombre || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={clientStyles.gridRow}>
          <View style={clientStyles.labelCell}>
            <Text style={clientStyles.label}>Tipo de Documento:</Text>
          </View>
          <View style={clientStyles.valueCell}>
            <Text style={clientStyles.value}>
              {formatDocumentType(orderData?.cliente_tipo_documento || "")}
            </Text>
          </View>
        </View>

        <View style={clientStyles.gridRowLast}>
          <View style={clientStyles.labelCell}>
            <Text style={clientStyles.label}>Número de Documento:</Text>
          </View>
          <View style={clientStyles.valueCell}>
            <Text style={clientStyles.value}>
              {orderData?.cliente_documento || 'N/A'}
            </Text>
          </View>
        </View>

        {sameAsOwner && (
          <View style={clientStyles.sameAsOwnerBadge}>
            <Text style={clientStyles.sameAsOwnerText}>
              ✓ El cliente es el propietario del vehículo
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}







// --------------------------------------------------
// 11. FIRMAS COMPLEMENTARIAS (CLIENTES / OTROS)
// --------------------------------------------------
function ComplementarySignaturesSection({
  orderData,
  templateData,
}: {
  orderData?: FetchEntryOrderResult;
  templateData?: OrderTemplateType;
}) {

  const signatures =
    orderData?.firmas_orden?.map((sig) => ({
      id: sig.template_signature_id,
      representative_type: sig.representative_type,
      signature_label: sig.signature_label,
      signature_url: sig.signature_url,
      declarations: sig.conditions.map((condition) => ({
        id: condition.condition_id,
        declaration_text: condition.declaration_text,
      })),
    })) ??
    templateData?.signatures?.map((sig) => ({
      id: sig.id,
      representative_type: sig.representative_type,
      signature_label: sig.signature_label,
      signature_url: null,
      declarations: sig.declarations.map((declaration) => ({
        id: declaration.id,
        declaration_text: declaration.declaration_text,
      })),
    })) ??
    [];

  if (signatures.length === 0) {
    return null;
  }

  return (
    <View style={complementaryStyles.container}>
      <View style={complementaryStyles.header}>
        <Text style={complementaryStyles.headerTitle}>
          10. Firmas de Aceptación y Declaraciones del Cliente
        </Text>
      </View>

      {signatures.map((signature, idx) => {
        const isLast = idx === signatures.length - 1;

        return (
          <View
            key={signature.id}
            style={
              isLast
                ? complementaryStyles.signatureItemLast
                : complementaryStyles.signatureItem
            }
          >
            {/* ENCABEZADO */}
            <View style={complementaryStyles.signatureHeader}>
              <Text style={complementaryStyles.signatureLabel}>
                {signature.representative_type}
              </Text>

              <Text style={complementaryStyles.representativeType}>
                {signature.signature_label}
              </Text>
            </View>

            {/* FIRMA */}
            <View style={complementaryStyles.imageContainer}>
              {signature.signature_url ? (
                <Image
                  src={signature.signature_url}
                  style={complementaryStyles.signatureImage}
                />
              ) : (
                <Text style={complementaryStyles.noSignatureText}>
                  Firma pendiente de captura
                </Text>
              )}
            </View>

            {/* DECLARACIONES */}
            <View style={complementaryStyles.declarationsContainer}>
              <Text style={complementaryStyles.declarationsTitle}>
                Declaraciones:
              </Text>

              {signature.declarations.length > 0 ? (
                signature.declarations.map((declaration) => (
                  <View
                    key={declaration.id}
                    style={complementaryStyles.declarationRow}
                  >
                    <Text style={complementaryStyles.bulletPoint}>
                      •
                    </Text>

                    <Text style={complementaryStyles.declarationText}>
                      {declaration.declaration_text}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={complementaryStyles.emptyDeclarations}>
                  No hay declaraciones asociadas a esta firma.
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}



// --------------------------------------------------
// 12. PIE DE PÁGINA
// --------------------------------------------------
function FooterSection({ orderData, fechaDoc }: {
  orderData: FetchEntryOrderResult | undefined;
  fechaDoc: string;
}) {
  return (
    <View style={footerStyles.footerContainer} fixed>
      <Text style={footerStyles.footerLeft}>
        {orderData?.plantilla_nombre || 'Orden de Ingreso Vehicular'}
      </Text>
      <Text style={footerStyles.footerCenter}>
        Documento generado electrónicamente - {fechaDoc}
      </Text>
      <Text
        style={footerStyles.footerRight}
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  );
}

// --------------------------------------------------
// 13. PIE DE PÁGINA
// --------------------------------------------------
function VoidedBannerSection({ orderData }: { orderData: FetchEntryOrderResult | undefined }) {
  if (orderData?.estado_orden !== 'anulada') {
    return null;
  }

  return (
    <View style={voidedStyles.voidedBanner} fixed>
      <Text style={voidedStyles.voidedBannerText}>ORDEN ANULADA</Text>
      <Text style={voidedStyles.voidedBannerSubtext}>
        Esta orden de entrada ha sido anulada y no tiene validez legal
      </Text>
    </View>
  );
}


// --------------------------------------------------
// 14. firma del dt
// --------------------------------------------------

function DirectorSection({ orderData }: { orderData: FetchEntryOrderResult | undefined }) {
  const formatDocType = (type: string | null) => {
    if (!type) return 'CC';
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <View style={directorStyles.directorSectionContainer}>
      <View style={directorStyles.directorSectionHeader}>
        <Text style={directorStyles.directorSectionTitle}>
          11. Director Técnico Responsable
        </Text>
      </View>

      <View style={directorStyles.directorTableCard}>
        <View style={directorStyles.directorTableHeader}>
          <Text style={directorStyles.directorHeaderText}>
            FIRMA Y RESPONSABILIDAD DEL DIRECTOR TÉCNICO
          </Text>
        </View>

        <View style={directorStyles.directorTableBody}>
          {/* COLUMNA 1: FIRMA */}
          <View style={[directorStyles.directorColumn, directorStyles.directorColumnSignature]}>
            <Text style={directorStyles.infoLabel}>FIRMA DIGITALIZADA</Text>
            <View style={directorStyles.signatureWrapper}>
              {orderData?.director_tecnico_firma ? (
                <Image
                  src={orderData.director_tecnico_firma}
                  style={directorStyles.signatureImage}
                />
              ) : (
                <Text style={directorStyles.emptyText}>
                  Firma No Registrada
                </Text>
              )}
            </View>
          </View>

          {/* COLUMNA 2: DATOS */}
          <View style={[directorStyles.directorColumn, directorStyles.directorColumnInfo]}>
            <View style={directorStyles.infoBlock}>
              <Text style={directorStyles.infoLabel}>
                NOMBRE COMPLETO DEL DIRECTOR TÉCNICO
              </Text>
              <Text style={directorStyles.infoValue}>
                {orderData?.director_tecnico_nombre || 'N/A'}
              </Text>
            </View>

            <View style={[directorStyles.infoBlock, { marginTop: 8 }]}>
              <Text style={directorStyles.infoLabel}>
                DOCUMENTO DE IDENTIFICACIÓN
              </Text>
              <Text style={directorStyles.infoValue}>
                {formatDocType(orderData?.director_tecnico_tipo_documento ?? null)}:: {orderData?.director_tecnico_documento || 'N/A'}
              </Text>
            </View>
          </View>

          {/* COLUMNA 3: ROL Y DECLARACIÓN */}
          <View style={[directorStyles.directorColumn, directorStyles.directorColumnLegal]}>
            <Text style={directorStyles.infoLabel}>ROL OPERATIVO</Text>
            <Text style={[directorStyles.infoValue, { color: '#2563eb', marginBottom: 6 }]}>
              DIRECTOR TÉCNICO
            </Text>
            <Text style={directorStyles.legalText}>
              El Director Técnico certifica que los procesos de inspección
              realizados en esta orden cumplen con los estándares técnicos
              y normativos establecidos por el Ministerio de Transporte
              y la normativa vigente de centros de diagnóstico automotor.
            </Text>
          </View>
        </View>

        <View style={directorStyles.directorFooterRow}>
          <Text style={directorStyles.directorFooterText}>
            Certificación técnica conforme a Resolución 1740 de 2020 y normativa
            vigente del Ministerio de Transporte de Colombia.
          </Text>
        </View>
      </View>
    </View>
  );
}






// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function OrderPDF({  orderData, templateData }: OrderPDFProps) {
  

  

  const fechaDoc = orderData?.plantilla_fecha_documento
    ? new Date(orderData.fecha).toLocaleDateString('es-CO')
    : 'N/A';

  const fechaEntrada = orderData?.fecha
    ? new Date(orderData.fecha).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: true,
      })
    : 'N/A';

  return (
    <Document
    title= {orderData? `${orderData.plantilla_nombre} ${orderData.vehiculo_placa} `:templateData?.template_name}
    author='Centro de Diagnostico Automotor Colombiano'
    creator='Cda-App'
    
    
    >
      <Page size="A4" style={pageStyles.page}>
        
        <HeaderSection
        
          orderData={orderData}
          fechaDoc={fechaDoc}
          templateData={templateData}
        />
         <VoidedBannerSection orderData={orderData} />
        
        <GeneralInfoSection orderData={orderData} fechaEntrada={fechaEntrada} />
        <VehicleSection orderData={orderData} />
        <PressureSection orderData={orderData} />
        <ConditionsSection orderData={orderData} templateData={templateData}/>
        <ObservationsSection orderData={orderData} />
        <ContractSection orderData={orderData} templateData={templateData}/>
        <InspectorSection orderData={orderData} />
        <OwnerSection orderData={orderData} />
        <ClientSection orderData={orderData} />
        <ComplementarySignaturesSection orderData={orderData} templateData={templateData}/>
        <DirectorSection orderData={orderData} />  {/* ← ANTES del footer */}
        <FooterSection orderData={orderData} fechaDoc={fechaDoc} />
        
      </Page>
    </Document>
  );
}
