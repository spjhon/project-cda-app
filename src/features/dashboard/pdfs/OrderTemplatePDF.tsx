"use client";

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";

const colors = {
  primary: "#1e293b",
  secondary: "#64748b",
  accent: "#4f46e5",
  border: "#e2e8f0",
  bg: "#f8fafc"
};

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  
  // --- ENCABEZADO COMPACTO ---
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottom: 1,
    borderBottomColor: colors.border,
    paddingBottom: 15,
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
    borderRadius: 4,
  },
  headerContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 15,
  },
  metaItem: {
    fontSize: 9,
    color: colors.secondary,
  },

  // --- SECCIÓN DE DATOS GENERALES ---
  orderInfoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    padding: 10,
    border: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  infoGroup: {
    width: '33.33%', // Tres columnas
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 7,
    color: colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: 5,
  },

// --- SECCIÓN VEHÍCULO ---
  vehicleSection: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    border: 1,
    borderColor: colors.primary, // Un borde un poco más fuerte para resaltar el vehículo
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: colors.primary,
    padding: 4,
    marginBottom: 8,
    borderRadius: 2,
    textTransform: 'uppercase',
  },

// --- SECCIÓN PRESIONES ---
  pressureSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  table: {
    display: 'table' as any,
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.border,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: colors.bg,
    padding: 4,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    textAlign: 'center',
    color: colors.primary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 4,
  },
  checkText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: 'bold',
  },

// --- SECCIÓN DE CONDICIONES ---
  conditionsSection: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: 0.5,
    borderBottomColor: colors.border,
    paddingBottom: 4,
    marginBottom: 4,
  },
  conditionMain: {
    flexDirection: 'column',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  conditionLabel: {
    fontSize: 9,
    color: colors.primary,
  },
  placeholderValue: {
    fontSize: 9,
    color: colors.secondary,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },


  // --- CUERPO ---
  contractSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: colors.bg,
    borderRadius: 4,
    border: 0.5,
    borderColor: colors.border,
  },
  contractTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.primary,
  },
  contractText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: colors.primary,
    textAlign: 'justify',
  },

  // --- SECCIÓN ACEPTACIÓN Y FIRMAS ---
  acceptanceSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f9f9f9', // El sombreado leve
    borderRadius: 6,           // Bordes redondeados
    border: 1,
    borderColor: '#e5e7eb',
  },
  acceptanceHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',          // Color oscuro para el título
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  declarationBox: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    borderBottomStyle: 'dashed',
  },
  declarationText: {
    fontSize: 7.5,
    color: '#374151',
    lineHeight: 1.4,
    textAlign: 'justify',
    marginBottom: 4,
  },
  // Reutilizamos/ajustamos el signatureBox anterior
  signatureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureBox: {
    width: '48%',
    height: 80,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: '#ffffff', // Cuadro blanco para que resalte sobre el fondo gris
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    borderRadius: 2,
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1f2937', // Color oscuro para que combine con el nuevo título
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  representativeType: {
    fontSize: 7,
    color: '#6b7280', // Un gris intermedio para el tipo de representante
    textAlign: 'center',
    marginTop: 2,
  },

// --- SECCIÓN RESPONSABLE DEL REGISTRO ---
  responsibleSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f3f4f6', // Un gris un poco más sólido que el de aceptación
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary, // Barra lateral para dar seriedad
  },
  responsibleHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#4b5563',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  responsibleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responsibleText: {
    fontSize: 8,
    color: '#1f2937',
    fontWeight: 'medium',
  },



  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: colors.secondary },
});

interface OrderTemplatePDFProps {
  data: OrderTemplate;
}

export const OrderTemplatePDF = ({ data }: OrderTemplatePDFProps) => {
  const sortedConditions = [...(data.conditions || [])].sort((a, b) => {
    if (a.is_special && !b.is_special) return -1;
    if (!a.is_special && b.is_special) return 1;
    return 0;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER COMPACTO */}
        <View style={styles.header}>
          {data.logo_url && (
            <Image 
              src={data.logo_url} 
              style={styles.logo} 
            />
          )}
          <View style={styles.headerContent}>
            <Text style={styles.title}>{data.template_name || "ORDEN DE ENTRADA"}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>Doc: {data.document_code}</Text>
              <Text style={styles.metaItem}>| Ver: {data.version}</Text>
              <Text style={styles.metaItem}>| Servicio: {data.service_type}</Text>
            </View>
          </View>
        </View>

        {/* DATOS DE LA ORDEN (Basado en la tabla entry_orders) */}
        <View style={styles.orderInfoSection}>
          {/* Fila 1 */}
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Consecutivo</Text>
            <Text style={styles.infoValue}># ___________</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Fecha de Entrada</Text>
            <Text style={styles.infoValue}>____ / ____ / ________</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>¿Es Reinspección?</Text>
            <Text style={styles.infoValue}>[  ] SÍ  /  [  ] NO</Text>
          </View>

          <View style={styles.divider} />

          {/* Fila 2 - Vehículo */}
          
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Kilometraje</Text>
            <Text style={styles.infoValue}>___________ km</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Vencimiento SOAT</Text>
            <Text style={styles.infoValue}>____ / ____ / ________</Text>
          </View>

          <View style={styles.divider} />

          {/* Fila 3 - Datos de Gas (si aplica) */}
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Nro. Certificado Gas</Text>
            <Text style={styles.infoValue}>____________________</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Vencimiento Gas</Text>
            <Text style={styles.infoValue}>____ / ____ / ________</Text>
          </View>
          <View style={{ width: '33.33%' }} /> {/* Espacio vacío para balancear */}
        </View>

        {/* SECCIÓN ESPECIFICACIONES DEL VEHÍCULO */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionHeader}>Especificaciones del Vehículo</Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Fila 1 - Identificación básica */}
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Placa</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Marca</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Línea</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Modelo</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>

            {/* Fila 2 - Características físicas */}
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Color</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Clase</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Combustible</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Cilindrada (cc)</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>

            {/* Fila 3 - Capacidades, Servicio y Tipo (NUEVA DISTRIBUCIÓN) */}
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Cap. Pasajeros</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '25%' }]}>
              <Text style={styles.infoLabel}>Tipo Servicio</Text>
              <Text style={styles.infoValue}>___________</Text>
            </View>
            <View style={[styles.infoGroup, { width: '50%' }]}>
              <Text style={styles.infoLabel}>Tipo de Vehículo</Text>
              <Text style={styles.infoValue}>______________________________</Text>
            </View>

            {/* Fila 4 - Atributos Booleanos */}
            <View style={[styles.infoGroup, { width: '100%', marginTop: 5 }]}>
              <Text style={styles.infoLabel}>Condiciones Especiales</Text>
              <Text style={styles.infoValue}>
                ¿Blindaje?: [ ] SÍ [ ] NO   |   ¿Es de Enseñanza?: [ ] SÍ [ ] NO
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN CONTROL DE PRESIÓN DE NEUMÁTICOS */}
        <View style={styles.pressureSection}>
          <Text style={styles.sectionHeader}>Control de Presión de Neumáticos (PSI)</Text>
          
          <View style={styles.table}>
            {/* Encabezado de Tabla */}
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '10%' }]}>
                <Text style={styles.tableCellHeader}>Eje</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text style={styles.tableCellHeader}>Posición / Lado</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Encontrada</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Ajustada</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '20%' }]}>
                <Text style={styles.tableCellHeader}>Repuesto</Text>
              </View>
            </View>

            {/* Filas de Ejemplo para Llenado (4 filas estándar) */}
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '10%' }]}>
                  <Text style={styles.tableCell}>____</Text>
                </View>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text style={styles.tableCell}>____________________</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>_______ psi</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>_______ psi</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>[ ] SÍ / [ ] NO</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Campo adicional solicitado */}
          <View style={styles.checkRow}>
            <Text style={styles.checkText}>
              ¿Es la presión adecuada para la prueba?  [  ] SÍ   [  ] NO
            </Text>
          </View>
        </View>

        {/* LISTA DE INSPECCIÓN */}
        <View style={styles.conditionsSection}>
          <Text style={[styles.contractTitle, { marginBottom: 10 }]}>REVISIÓN DE CONDICIONES</Text>
          {sortedConditions.map((condition) => (
            <View key={condition.id} style={styles.conditionRow} wrap={false}>
              <View style={styles.conditionMain}>
                {condition.is_special && condition.special_condition_label && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{condition.special_condition_label}</Text>
                  </View>
                )}
                <Text style={styles.conditionLabel}>{condition.label}</Text>
              </View>
              <Text style={styles.placeholderValue}>[ CUMPLE ]</Text>
            </View>
          ))}
        </View>

        {/* OBSERVACIONES */}
        <View style={{ marginTop: 15, marginBottom: 15 }}>
            <Text style={styles.infoLabel}>Observaciones de la Orden:</Text>
            <View style={{ borderBottom: 1, borderBottomColor: colors.border, height: 20 }} />
            <View style={{ borderBottom: 1, borderBottomColor: colors.border, height: 20 }} />
        </View>

        {/* CUERPO CONTRACTUAL */}
        <View style={styles.contractSection}>
          <Text style={styles.contractTitle}>CONDICIONES CONTRACTUALES</Text>
          <Text style={styles.contractText}>{data.base_contract_text}</Text>
        </View>

      {/* SECCIÓN ACEPTACIÓN DEL SERVICIO */}
        <View style={styles.acceptanceSection} wrap={false}>
          <Text style={styles.acceptanceHeader}>Aceptación del Servicio</Text>

          {/* Renderizado de Declaraciones/Condiciones por cada firma */}
          {data.signatures?.map((sig) => (
            <View key={`decl-${sig.id}`} style={styles.declarationBox}>
              <Text style={[styles.infoLabel, { marginBottom: 4 }]}>
                Declaraciones: {sig.signature_label}
              </Text>
              {sig.declarations?.map((decl) => (
                <Text key={decl.id} style={styles.declarationText}>
                  • {decl.declaration_text}
                </Text>
              ))}
            </View>
          ))}

          {/* Renderizado de Cuadros de Firma */}
          <View style={styles.signatureContainer}>
            {data.signatures?.map((sig) => (
              <View key={`sig-${sig.id}`} style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>
                  {sig.signature_label}
                </Text>
                <Text style={styles.representativeType}>
                  {sig.representative_type}
                </Text>
              </View>
            ))}
          </View>
        </View>



        {/* SECCIÓN RESPONSABLE DE LA DILIGENCIA */}
        <View style={styles.responsibleSection}>
          <Text style={styles.responsibleHeader}>Responsable de la Inspección</Text>
          
          <View style={styles.responsibleRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.responsibleText}>
                Nombre: ________________________________________________
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.responsibleText}>
                C.C. / Registro: ________________
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.responsibleText}>
                Fecha: {new Date().toLocaleDateString('es-CO')}
              </Text>
            </View>
          </View>
        </View>


      
        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CDA App - Peritajes Jan</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>

      </Page>
    </Document>
  );
};