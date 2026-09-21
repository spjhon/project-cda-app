"use client";

import { SarlaftEvidence } from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

import { Svg, Path } from "@react-pdf/renderer";

const CheckMark = () => (
  <Svg width={10} height={10} viewBox="0 0 10 10">
    <Path
      d="M1.5 5.2 L4 7.5 L8.5 2.5"
      stroke="#000000"
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


// ============================================================
// PROPS
// ============================================================

interface SarlaftPDFProps {
  evidenceData?: SarlaftEvidence;
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // PÁGINA
  // ==========================================================

  page: {
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },

  // ==========================================================
  // ENCABEZADO
  // ==========================================================

  header: {
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
    textAlign: "center",
  },

  documentCode: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
    textAlign: "center",
  },

  documentSubtitle: {
    fontSize: 6.5,
    color: "#6b7280",
    textAlign: "center",
  },

  // ==========================================================
  // BLOQUES
  // ==========================================================

  section: {
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 3,
    overflow: "hidden",
  },

  sectionHeader: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
  },

  sectionBody: {
    padding: 7,
  },

  // ==========================================================
  // CAMPOS
  // ==========================================================

  row: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 7,
  },

  field: {
    flex: 1,
  },

  fieldFull: {
    width: "100%",
    marginBottom: 4,
  },

  label: {
    fontSize: 6,
    color: "#6b7280",
    marginBottom: 1,
    textTransform: "uppercase",
  },

  value: {
    fontSize: 8,
    color: "#111827",
    minHeight: 9,
  },

  // ==========================================================
  // PEP
  // ==========================================================

  pepContainer: {
    marginTop: 2,
    padding: 5,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 2,
  },

  pepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#111827",
   
  },

  pepTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#111827",
  },

  pepDescription: {
    fontSize: 5.7,
    lineHeight: 1.2,
    color: "#6b7280",
    marginTop: 2,
  },

  // ==========================================================
  // DECLARACIÓN
  // ==========================================================

  declaration: {
    fontSize: 6.8,
    lineHeight: 1.3,
    textAlign: "justify",
    color: "#374151",
    marginBottom: 6,
  },

  // ==========================================================
  // FIRMA CLIENTE
  // ==========================================================

  signatureArea: {
    marginTop: 2,
    alignItems: "center",
  },

  signatureImageContainer: {
    height: 48,
    width: 210,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 2,
  },

  signatureImage: {
    maxHeight: 42,
    maxWidth: 190,
    objectFit: "contain",
  },

  signatureFallback: {
    fontSize: 6,
    color: "#9ca3af",
    textAlign: "center",
  },

  signatureLine: {
    width: 210,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 2,
  },

  signatureLabel: {
    fontSize: 5.8,
    color: "#6b7280",
    textAlign: "center",
  },

  // ==========================================================
  // VERIFICACIÓN
  // ==========================================================

  verificationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  verificationBox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: "#374151",
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  verificationCheck: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#111827",
  },

  verificationText: {
    fontSize: 7,
    color: "#111827",
  },

  // ==========================================================
  // FIRMA INSPECTOR
  // ==========================================================

  inspectorSignatureArea: {
    marginTop: 4,
    alignItems: "center",
  },

  inspectorSignatureSpace: {
    height: 35,
    width: 210,
    alignItems: "center",
    justifyContent: "center",
  },

  inspectorSignatureFallback: {
    fontSize: 6,
    color: "#9ca3af",
    textAlign: "center",
  },

  inspectorSignatureLine: {
    width: 210,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 2,
  },

  inspectorSignatureLabel: {
    fontSize: 5.8,
    color: "#6b7280",
    textAlign: "center",
  },

  inspectorSignatureImage: {
  width: 140,
  height: 55,
  objectFit: "contain",
},

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    position: "absolute",
    bottom: 12,
    left: 32,
    right: 32,
    alignItems: "center",
  },

  footerText: {
    fontSize: 5.5,
    color: "#9ca3af",
    textAlign: "center",
  },
});

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateString?: string | null): string {
  if (!dateString) return "No disponible";

  try {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getValue(value?: string | null): string {
  if (!value || value.trim() === "") {
    return "No disponible";
  }

  return value;
}

// ============================================================
// COMPONENTE: CAMPO
// ============================================================

interface FieldProps {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}

function Field({
  label,
  value,
  fullWidth = false,
}: FieldProps) {
  return (
    <View style={fullWidth ? styles.fieldFull : styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.value}>
        {getValue(value)}
      </Text>
    </View>
  );
}

// ============================================================
// COMPONENTE: PEP
// ============================================================

interface PepFieldProps {
  value: boolean;
}

function PepField({ value }: PepFieldProps) {
  return (
    <View style={styles.pepContainer}>
      <View style={styles.pepRow}>
        <View style={styles.checkbox}>
          
           
         
        </View>

        <Text style={styles.pepTitle}>
          Persona Expuesta Públicamente (PEP)
        </Text>
      </View>

      <Text style={styles.pepDescription}>
        Cargos publicos altos, manejo de recursos estatales o
        familiares hasta 2do grado de consanguinidad en dichos cargos.
      </Text>

      <Text style={styles.pepDescription}>
        Resultado: {value ? "SÍ" : "NO"}
      </Text>
    </View>
  );
}

// ============================================================
// COMPONENTE: VERIFICACIÓN
// ============================================================

interface VerificationItemProps {
  children: string;
}

function VerificationItem({
  children,
}: VerificationItemProps) {
  return (
    <View style={styles.verificationRow}>
      <View style={styles.verificationBox}>
        <Text style={styles.verificationCheck}>
          ✓
        </Text>
        <CheckMark />
      </View>

      <Text style={styles.verificationText}>
        {children}
      </Text>
    </View>
  );
}

// ============================================================
// COMPONENTE: FIRMA DEL CLIENTE
// ============================================================

interface CustomerSignatureProps {
  signature?: string | null;
  customerName?: string | null;
  customerDocument?: string | null;
}

function CustomerSignature({
  signature,
  customerName,
  customerDocument,
}: CustomerSignatureProps) {
  return (
    <View style={styles.signatureArea}>
      <View style={styles.signatureImageContainer}>
        {signature ? (
          <Image
            src={signature}
            style={styles.signatureImage}
          />
        ) : (
          <Text style={styles.signatureFallback}>
            Firma del cliente no disponible
          </Text>
        )}
      </View>

      <View style={styles.signatureLine} />

      <Text style={styles.signatureLabel}>
        FIRMA DEL CLIENTE
      </Text>

      <Text style={styles.signatureLabel}>
        {getValue(customerName)}
      </Text>

      <Text style={styles.signatureLabel}>
        {getValue(customerDocument)}
      </Text>
    </View>
  );
}

// ============================================================
// COMPONENTE: INFORMACIÓN CLIENTE
// ============================================================

interface CustomerSectionProps {
  evidence?: SarlaftEvidence;
  createdAt: string | null;
  placa: string | null;
}

function CustomerSection({
  evidence,
  createdAt,
  placa,
}: CustomerSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          1. INFORMACIÓN DEL CLIENTE
        </Text>
      </View>

      <View style={styles.sectionBody}>
        <View style={styles.row}>
          <Field
            label="Fecha de consulta"
            value={formatDate(createdAt)}
          />

          <Field
            label="Placa"
            value={placa}
          />
        </View>

        <View style={styles.row}>
          <Field
            label="Nombre completo"
            value={evidence?.nombre_completo_snapshot}
          />
        </View>

        <View style={styles.row}>
          <Field
            label="Tipo de documento"
            value={evidence?.tipo_documento_snapshot}
          />

          <Field
            label="Número de documento"
            value={evidence?.numero_documento_snapshot}
          />
        </View>

        <View style={styles.row}>
          <Field
            label="Actividad económica"
            value={evidence?.actividad_economica_snapshot}
          />

          <Field
            label="Origen de los fondos"
            value={evidence?.origen_fondos_snapshot}
          />
        </View>

        <PepField
          value={
            evidence?.es_persona_publicamente_expuesta_snapshot ??
            false
          }
        />
      </View>
    </View>
  );
}

// ============================================================
// COMPONENTE: INFORMACIÓN PROPIETARIO
// ============================================================

interface OwnerSectionProps {
  evidence?: SarlaftEvidence;
}

function OwnerSection({
  evidence,
}: OwnerSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          2. INFORMACIÓN DEL PROPIETARIO
        </Text>
      </View>

      <View style={styles.sectionBody}>
        <View style={styles.row}>
          <Field
            label="Nombre completo"
            value={evidence?.nombre_completo_snapshot}
          />
        </View>

        <View style={styles.row}>
          <Field
            label="Tipo de documento"
            value={evidence?.tipo_documento_snapshot}
          />

          <Field
            label="Número de documento"
            value={evidence?.numero_documento_snapshot}
          />
        </View>

        <PepField
          value={
            evidence?.es_persona_publicamente_expuesta_snapshot ??
            false
          }
        />
      </View>
    </View>
  );
}

// ============================================================
// COMPONENTE: DECLARACIÓN Y FIRMA
// ============================================================

interface DeclarationSectionProps {
  signature?: string | null;
  customerName?: string | null;
  customerDocument?: string | null;
}

function DeclarationSection({
  signature,
  customerName,
  customerDocument,
}: DeclarationSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          3. DECLARACIÓN Y AUTORIZACIÓN
        </Text>
      </View>

      <View style={styles.sectionBody}>
        <Text style={styles.declaration}>
          DECLARACIÓN: Los recursos para este servicio provienen de
          actividades licitas. No tengo relacion con lavado de activos
          o financiacion del terrorismo. Autorizo al centro de
          diagnostico automotor para consultar mis datos y aquellos
          consignados en la licencia de transito (tambien conocida
          como tarjeta de propiedad) en listas restrictivas y bases
          de datos de prevencion.
        </Text>

        <CustomerSignature
          signature={signature}
          customerName={customerName}
          customerDocument={customerDocument}
        />
      </View>
    </View>
  );
}

// ============================================================
// COMPONENTE: VERIFICACIÓN
// ============================================================

interface VerificationSectionProps {
  customerEvidence?: SarlaftEvidence;
}

function VerificationSection({
  customerEvidence,
}: VerificationSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          4. VERIFICACIÓN DE LA CONSULTA
        </Text>
      </View>

      <View style={styles.sectionBody}>
        <VerificationItem>
          Consultó lista OFAC
        </VerificationItem>
        <VerificationItem>
          Consultó lista ONU
        </VerificationItem>
        <VerificationItem>
          Consultó listas
        </VerificationItem>

        <VerificationItem>
          Verificó que el riesgo sea bajo
        </VerificationItem>

        <VerificationItem>
          PEP (persona públicamente expuesta) verificado
        </VerificationItem>

        <View style={styles.inspectorSignatureArea}>
          <View style={styles.inspectorSignatureSpace}>
            {customerEvidence?.funcionario_firma_path ? (
              <Image
                src={customerEvidence.funcionario_firma_path}
                style={styles.inspectorSignatureImage}
              />
            ) : (
              <Text style={styles.inspectorSignatureFallback}>
                Firma del inspector no registrada
              </Text>
            )}
          </View>

          <View style={styles.inspectorSignatureLine} />

          <Text style={styles.inspectorSignatureLabel}>
            FIRMA DEL INSPECTOR / FUNCIONARIO
          </Text>
        </View>
      </View>
    </View>
  );
}
// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SarlaftPDF({
  evidenceData,
}: SarlaftPDFProps) {
  // ----------------------------------------------------------
  // DATOS GENERALES
  // ----------------------------------------------------------

  const createdAt = evidenceData?.created_at ?? null;

  const placa = evidenceData?.placa_snapshot ?? null;

  // ----------------------------------------------------------
  // FIRMA DEL CLIENTE
  // ----------------------------------------------------------
  // El hook/RPC ahora trabaja con cliente_firma_path.
  // Antes de llegar aquí, View/Download PDF reemplazan
  // este valor por el Data URL de la imagen.
  // ----------------------------------------------------------

  const customerSignature =
    evidenceData?.cliente_firma_path ?? null;

  // ----------------------------------------------------------
  // DOCUMENTO
  // ----------------------------------------------------------

  return (
    <Document
      title="Evidencia Consulta SARLAFT"
      author="Centro de Diagnóstico Automotor"
      subject="Evidencia de consulta SARLAFT"
      creator="CDA App"
    >
      <Page
        size="LETTER"
        style={styles.page}
      >
        {/* ====================================================
            ENCABEZADO
        ==================================================== */}

        <View style={styles.header}>
          <Text style={styles.title}>
            EVIDENCIA CONSULTA SARLAFT
          </Text>

          <Text style={styles.documentCode}>
            CDA-SAR-001
          </Text>

          <Text style={styles.documentSubtitle}>
            SARLAFT - Regimen de Medidas Simplificadas -
            Res. 4607 de 2026
          </Text>
        </View>

        {/* ====================================================
            SECCIÓN 1
        ==================================================== */}

        <CustomerSection
          evidence={evidenceData}
          createdAt={createdAt}
          placa={placa}
        />

        {/* ====================================================
            SECCIÓN 2
        ==================================================== */}

        <OwnerSection
          evidence={evidenceData}
        />

        {/* ====================================================
            SECCIÓN 3
        ==================================================== */}

        <DeclarationSection
          signature={customerSignature}
          customerName={
            evidenceData?.nombre_completo_snapshot
          }
          customerDocument={
            evidenceData?.numero_documento_snapshot
          }
        />

        {/* ====================================================
            SECCIÓN 4
        ==================================================== */}

        <VerificationSection
          customerEvidence={evidenceData}
        />

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Documento generado como evidencia de consulta SARLAFT
          </Text>

          <Text style={styles.footerText}>
            CDA-SAR-001
          </Text>
        </View>
      </Page>
    </Document>
  );
}