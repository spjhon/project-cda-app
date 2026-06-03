"use client";

import { UserContextData } from '@/app/[tenant]/dashboard/layout';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

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
// 9. ESTILOS DEL PIE DE PÁGINA
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

// ============================================================
// INTERFACES
// ============================================================
interface OrderPDFProps {
  logoURL: string | undefined;
  orderData: any;
  user: UserContextData | undefined;
}

// ============================================================
// SUB-COMPONENTES (declarados FUERA del componente principal)
// ============================================================

// --------------------------------------------------
// 1. ENCABEZADO
// --------------------------------------------------
function HeaderSection({ finalLogo, orderData, fechaDoc }: {
  finalLogo: string | undefined;
  orderData: any;
  fechaDoc: string;
}) {
  return (
    <View style={headerStyles.headerContainer}>
      <View style={headerStyles.logoSection}>
        {finalLogo ? (
          <Image src={finalLogo} style={headerStyles.logo} />
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
            {orderData?.plantilla_codigo_documento || 'N/A'}
          </Text>
        </View>
        <View style={headerStyles.metaRow}>
          <Text style={headerStyles.metaLabel}>Versión:</Text>
          <Text style={headerStyles.metaValue}>
            {orderData?.plantilla_version !== undefined ? orderData.plantilla_version : 'N/A'}
          </Text>
        </View>
        <View style={headerStyles.metaRow}>
          <Text style={headerStyles.metaLabel}>Fecha Doc:</Text>
          <Text style={headerStyles.metaValue}>{fechaDoc}</Text>
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
  orderData: any;
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
            {formatServiceType(orderData?.service_type)}
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
function VehicleSection({ orderData }: { orderData: any }) {
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
            {formatFechaSnapshot(orderData?.soat_vencimiento_snapshot)}
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
            {formatFechaSnapshot(orderData?.gas_vencimiento_snapshot)}
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
function PressureSection({ orderData }: { orderData: any }) {
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
        orderData.presiones_llantas.map((tp: any, index: number) => {
          const isLast = index === orderData.presiones_llantas.length - 1;
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
function ConditionsSection({ orderData }: { orderData: any }) {
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
            Ítem / Condición Evaluada
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

      {orderData?.condiciones_plantilla &&
      orderData.condiciones_plantilla.length > 0 ? (
        orderData.condiciones_plantilla.map((cond: any, index: number) => {
          const isLast = index === orderData.condiciones_plantilla.length - 1;
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
                {cond.value === 'cumple' ? (
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
function ObservationsSection({ orderData }: { orderData: any }) {
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
function ContractSection({ orderData }: { orderData: any }) {
  return (
    <View style={sectionStyles.sectionContainer}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          6. Declaración y Clausulado Contractual
        </Text>
      </View>

      {orderData?.plantilla_texto_contractual &&
      orderData.plantilla_texto_contractual.trim() !== '' ? (
        <View style={contractStyles.contratoContainer}>
          <Text style={contractStyles.contratoText}>
            {orderData.plantilla_texto_contractual}
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
function InspectorSection({ user }: { user: UserContextData | undefined }) {
  return (
    <View style={inspectorStyles.inspectorSectionContainer}>
      <View style={inspectorStyles.inspectorSectionHeader}>
        <Text style={inspectorStyles.inspectorSectionTitle}>
          7. Datos y Reconocimiento del Inspector Responsable
        </Text>
      </View>

      <View style={inspectorStyles.inspectorTableCard}>
        <View style={inspectorStyles.inspectorTableHeader}>
          <Text style={inspectorStyles.inspectorHeaderText}>
            DATOS Y RECONOCIMIENTO DEL INSPECTOR RESPONSABLE
          </Text>
        </View>

        <View style={inspectorStyles.inspectorTableBody}>
          {/* COLUMNA 1: FIRMA DIGITALIZADA */}
          <View
            style={[
              inspectorStyles.inspectorColumn,
              inspectorStyles.inspectorColumnSignature,
            ]}
          >
            <Text style={inspectorStyles.infoLabel}>FIRMA DIGITALIZADA</Text>
            <View style={inspectorStyles.signatureWrapper}>
              {user?.signature_base64 ? (
                <Image
                  src={user.signature_base64}
                  style={inspectorStyles.signatureImage}
                />
              ) : (
                <Text style={inspectorStyles.emptyText}>
                  Firma No Registrada
                </Text>
              )}
            </View>
          </View>

          {/* COLUMNA 2: INFORMACIÓN DEL FUNCIONARIO */}
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
                {user?.name || 'N/A'}
              </Text>
            </View>

            <View style={[inspectorStyles.infoBlock, { marginTop: 8 }]}>
              <Text style={inspectorStyles.infoLabel}>
                DOCUMENTO DE IDENTIFICACIÓN
              </Text>
              <Text style={inspectorStyles.infoValue}>
                {user?.document_type
                  ? user.document_type.toUpperCase()
                  : 'CC'}
                : {user?.document_number || '-----------'}
              </Text>
            </View>
          </View>

          {/* COLUMNA 3: ROL Y DECLARACIÓN LEGAL */}
          <View
            style={[
              inspectorStyles.inspectorColumn,
              inspectorStyles.inspectorColumnLegal,
            ]}
          >
            <Text style={inspectorStyles.infoLabel}>ROL OPERATIVO</Text>
            <Text
              style={[
                inspectorStyles.infoValue,
                { color: '#2563eb', marginBottom: 6 },
              ]}
            >
              RECEPCIONISTA / INSPECTOR TÉCNICO
            </Text>
            <Text style={inspectorStyles.legalText}>
              El presente funcionario certifica que la información del vehículo y
              la orden de entrada han sido validadas conforme al sistema de gestión
              ISO 17020 del CDA.
            </Text>
          </View>
        </View>

        <View style={inspectorStyles.inspectorFooterRow}>
          <Text style={inspectorStyles.inspectorFooterText}>
            Registro de auditoría interna - Documento digitalizado de uso
            exclusivo para procesos de control vehicular.
          </Text>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// 9. PIE DE PÁGINA
// --------------------------------------------------
function FooterSection({ orderData, fechaDoc }: {
  orderData: any;
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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function OrderPDF({ logoURL, orderData, user }: OrderPDFProps) {
  const finalLogo = logoURL || orderData?.plantilla_logo_url;

  const fechaDoc = orderData?.plantilla_fecha_documento
    ? new Date(orderData.plantilla_fecha_documento).toLocaleDateString('es-CO')
    : 'N/A';

  const fechaEntrada = orderData?.fecha
    ? new Date(orderData.fecha).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: true,
      })
    : 'N/A';

  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <HeaderSection
          finalLogo={finalLogo}
          orderData={orderData}
          fechaDoc={fechaDoc}
        />
        <GeneralInfoSection orderData={orderData} fechaEntrada={fechaEntrada} />
        <VehicleSection orderData={orderData} />
        <PressureSection orderData={orderData} />
        <ConditionsSection orderData={orderData} />
        <ObservationsSection orderData={orderData} />
        <ContractSection orderData={orderData} />
        <InspectorSection user={user} />
        <FooterSection orderData={orderData} fechaDoc={fechaDoc} />
      </Page>
    </Document>
  );
}
