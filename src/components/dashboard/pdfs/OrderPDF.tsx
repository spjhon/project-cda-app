"use client";

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  // ==========================================
  // ESTILOS DEL ENCABEZADO
  // ==========================================
  headerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    height: 65,
    marginBottom: 15, // Bajamos un poco para pegar el bloque de datos
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

  // ==========================================
  // 🔥 NUEVOS ESTILOS: SECCIÓN DE INFORMACIÓN GENERAL
  // ==========================================
  sectionContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    borderRadius: 4,
    marginBottom: 15,
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9', // slate-100 para diferenciar bloques
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155', // slate-700
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
    flex: 1, // Divide la fila equitativamente (2 columnas)
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
    color: '#64748b', // slate-500
    width: '40%',
  },
  cellValue: {
    fontSize: 8,
    color: '#0f172a', // slate-900
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
//seccion del vehiculo
placaBox: {
    backgroundColor: '#fef08a', // Amarillo sutil de placa colombiana
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



  //ESTILOS DE LAS PRESIONES DE LAS LLANTAS
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

// Anchos de las columnas
colEje: { width: '15%' },
colPos: { width: '35%' },
colPres: { width: '25%' },


tableCell: {
  fontSize: 8,
  color: '#0f172a', // slate-900
  textAlign: 'center', // 🔥 Fuerza el centrado en la celda
},
tableCellLeft: {
  fontSize: 8,
  color: '#0f172a',
  textAlign: 'left', // Para la posición si prefieres que no se centre todo
  paddingLeft: 10,
},



cond_tableHeader: {
    backgroundColor: '#f8fafc', // slate-50
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1', // slate-300
    paddingVertical: 5,
  },
  cond_tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#334155', // slate-700
    textTransform: 'uppercase',
  },
  cond_tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // slate-200
    paddingVertical: 5,
    alignItems: 'center',
  },
  cond_tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  // Anchos de columnas proporcionales
  cond_colLabel: {
    width: '75%',
    paddingLeft: 8,
  },
  cond_colValue: {
    width: '25%',
  },
  // Estilos de los textos internos
  cond_textLabel: {
    fontSize: 8,
    color: '#0f172a', // slate-900
  },
  // Badges de estado dinámicos
  badgeCumple: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#15803d', // green-700
    textAlign: 'center',
    backgroundColor: '#dcfce7', // green-100
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
    color: '#64748b', // slate-500
    textAlign: 'center',
    backgroundColor: '#f1f5f9', // slate-100
    paddingVertical: 2,
    marginHorizontal: 15,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    textTransform: 'uppercase',
  },

  cond_textSpecialLabel: {
    fontSize: 7.5,
    color: '#475569', // Un tono más suave (slate-600)
    fontStyle: 'italic',
    marginTop: 2, // Despega un poco del label principal
  },


  //Observacionones de la orden de entrada
  observacionesContainer: {
    padding: 8,
    backgroundColor: '#f8fafc', // Fondo limpio
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3, 
    borderLeftColor: '#64748b', // Línea de énfasis lateral en gris oscuro
    borderRadius: 4,
    marginTop: 2,
  },
  observacionesText: {
    fontSize: 8,
    color: '#334155', // slate-700 para una lectura descansada
    lineHeight: 1.4, // Espaciado entre líneas para textos largos
  },
  observacionesVacias: {
    fontSize: 8,
    color: '#94a3b8', // Texto atenuado si no hay nada
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 4,
  },

//Condicones contrractuales
contratoContainer: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
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
  }
  

});

interface OrderPDFProps {
  logoURL: string | undefined;
  orderData: any;
}

export default function OrderPDF({ logoURL, orderData }: OrderPDFProps) {
  const finalLogo = logoURL || orderData?.plantilla_logo_url;

  // Formatear Fecha de Plantilla (Encabezado)
  const fechaDoc = orderData?.plantilla_fecha_documento 
    ? new Date(orderData.plantilla_fecha_documento).toLocaleDateString('es-CO')
    : 'N/A';

  // 🔥 Formatear Fecha y Hora de Entrada de la Orden
  const fechaEntrada = orderData?.fecha
    ? new Date(orderData.fecha).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: true
      })
    : 'N/A';

  // Mapeo amigable para el Service Type Enum
  const formatServiceType = (type: string) => {
    if (!type) return 'N/A';
    // Reemplaza guiones bajos por espacios y capitaliza (Ej: "revision_tecnica" -> "Revision Tecnica")
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };



const formatFechaSnapshot = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-CO');
};



  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ==========================================
            ENCABEZADO
           ========================================== */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            {finalLogo ? (
              <Image src={finalLogo} style={styles.logo} />
            ) : (
              <Text style={styles.logoFallback}>TU LOGO</Text>
            )}
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.documentTitle}>
              {orderData?.plantilla_nombre || "Orden de Ingreso Vehicular"}
            </Text>
          </View>

          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Código:</Text>
              <Text style={styles.metaValue}>{orderData?.plantilla_codigo_documento || 'N/A'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Versión:</Text>
              <Text style={styles.metaValue}>
                {orderData?.plantilla_version !== undefined ? orderData.plantilla_version : 'N/A'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Fecha Doc:</Text>
              <Text style={styles.metaValue}>{fechaDoc}</Text>
            </View>
            <View style={styles.metaRowLast}>
              <Text style={[styles.metaLabel, { color: '#312e81' }]}>N° Orden:</Text>
              <Text style={[styles.metaValue, styles.consecutivoText]}>
                {orderData?.consecutivo || '0000'}
              </Text>
            </View>
          </View>
        </View>

        {/* ==========================================
            🔥 NUEVA SECCIÓN: DATOS DE LA ORDEN
           ========================================== */}
        <View style={styles.sectionContainer}>
          {/* Título de la subsección */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. Información General del Ingreso</Text>
          </View>

          {/* Fila 1: Fecha de Entrada y Tipo de Servicio */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Fecha Entrada:</Text>
              <Text style={styles.cellValue}>{fechaEntrada}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Tipo Servicio:</Text>
              <Text style={[styles.cellValue, { fontWeight: 'medium' }]}>
                {formatServiceType(orderData?.service_type)}
              </Text>
            </View>
          </View>

          {/* Fila 2: ¿Es Reinspección? */}
          <View style={styles.gridRowLast}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>¿Reinspección?:</Text>
              {orderData?.es_reinspeccion ? (
                <Text style={[styles.cellValue, styles.badgeReinspeccion, { color: '#b45309', backgroundColor: '#fef3c7' }]}>
                  SÍ (Segunda revisión)
                </Text>
              ) : (
                <Text style={[styles.cellValue, { color: '#475569' }]}>
                  NO (Primera vez)
                </Text>
              )}
            </View>
            {/* Celda vacía a la derecha para mantener el balance simétrico de 2 columnas */}
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}></Text>
              <Text style={styles.cellValue}></Text>
            </View>
          </View>
        </View>

        {/* ==========================================
            SECCIÓN: DATOS DEL VEHÍCULO Y SNAPSHOTS
           ========================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Identificación del Vehículo y Documentos</Text>
          </View>

          {/* Fila 1: Placa y Tipo de Vehículo */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Placa:</Text>
              <View style={{ width: '60%', alignItems: 'flex-start' }}>
                <Text style={styles.placaBox}>
                  {orderData?.vehiculo_placa ? orderData.vehiculo_placa.toUpperCase() : 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Tipo Vehículo:</Text>
              <Text style={[styles.cellValue, styles.textCapitalize]}>
                {orderData?.vehiculo_tipo_vehiculo?.replace(/_/g, ' ') || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Fila 2: Marca y Línea */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Marca:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_marca || 'N/A'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Línea:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_linea || 'N/A'}</Text>
            </View>
          </View>

          {/* Fila 3: Modelo y Color */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Modelo:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_modelo || 'N/A'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Color:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_color || 'N/A'}</Text>
            </View>
          </View>

          {/* Fila 4: Clase y Tipo de Servicio */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Clase:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_clase || 'N/A'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Clase Servicio:</Text>
              <Text style={[styles.cellValue, styles.textCapitalize]}>
                {orderData?.vehiculo_tipo_servicio_vehiculo || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Fila 5: Combustible y Cilindrada */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Combustible:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_combustible || 'N/A'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Cilindrada:</Text>
              <Text style={styles.cellValue}>
                {orderData?.vehiculo_cilindrada ? `${orderData.vehiculo_cilindrada} c.c.` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Fila 6: Capacidad Pasajeros y Kilometraje (Snapshot de la Orden) */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Capacidad Pas.:</Text>
              <Text style={styles.cellValue}>{orderData?.vehiculo_capacidad_pasajeros || 'N/A'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Kilometraje Act:</Text>
              <Text style={[styles.cellValue, { fontWeight: 'bold' }]}>
                {orderData?.kilometraje ? `${orderData.kilometraje} Km` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Fila 7: Vencimiento SOAT y Certificado de Gas (Snapshots) */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Vence SOAT:</Text>
              <Text style={styles.cellValue}>{formatFechaSnapshot(orderData?.soat_vencimiento_snapshot)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>N° Cert. Gas:</Text>
              <Text style={styles.cellValue}>{orderData?.gas_numero_snapshot || 'N/A'}</Text>
            </View>
          </View>

         

          {/* Fila 8: Vencimiento Gas y ¿Es Blindado? */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>Vence Gas:</Text>
              <Text style={styles.cellValue}>{formatFechaSnapshot(orderData?.gas_vencimiento_snapshot)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>¿Es Blindado?:</Text>
              <Text style={styles.cellValue}>
                {orderData?.vehiculo_blindaje ? 'SÍ (Posee Blindaje)' : 'NO'}
              </Text>
            </View>
          </View>

          {/* Fila 9: ¿Vehículo de Enseñanza? y ¿Es Extranjero? (Última fila del bloque) */}
          <View style={styles.gridRowLast}>
            <View style={[styles.gridCell, styles.gridCellBorderRight]}>
              <Text style={styles.cellLabel}>¿Enseñanza?:</Text>
              <Text style={styles.cellValue}>
                {orderData?.vehiculo_es_ensenanza ? 'SÍ (Escuela automovilística)' : 'NO'}
              </Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>¿Es Extranjero?:</Text>
              <Text style={styles.cellValue}>
                {orderData?.vehiculo_es_extranjero ? 'SÍ (Placa fuera del país)' : 'NO'}
              </Text>
            </View>
          </View>
        </View>



        {/* ==========================================
            SECCIÓN: PRESIONES DE INFLADO
           ========================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. Control de Presión de Neumáticos (PSI)</Text>
          </View>

          {/* Cabecera de la Tabla */}
          <View style={styles.tableHeader}>
            <View style={styles.colEje}><Text style={styles.tableHeaderText}>Eje</Text></View>
            <View style={styles.colPos}><Text style={styles.tableHeaderText}>Posición</Text></View>
            <View style={styles.colPres}><Text style={styles.tableHeaderText}>Encontrada</Text></View>
            <View style={styles.colPres}><Text style={styles.tableHeaderText}>Ajustada</Text></View>
          </View>

          {/* Listado de Presiones mapeadas del JSONB */}
          {orderData?.presiones_llantas && orderData.presiones_llantas.length > 0 ? (
            orderData.presiones_llantas.map((tp: any, index: number) => (
              <View key={index} style={index === orderData.presiones_llantas.length - 1 ? styles.tableRowLast : styles.tableRow}>
                
                {/* 1. Columna Eje: Llama a tableCell (Centrado automático) */}
                <View style={styles.colEje}>
                  <Text style={styles.tableCell}>{tp.eje}</Text>
                </View>
                
                {/* 2. Columna Posición: Llama a tableCellLeft + capitalizado */}
                <View style={styles.colPos}>
                  <Text style={[styles.tableCell, styles.textCapitalize]}>
                    {tp.posicion.replace(/_/g, ' ')}
                  </Text>
                </View>
                
                {/* 3. Columna Encontrada: Llama a tableCell (Centrado) + Negrita si existe */}
                <View style={styles.colPres}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                    {tp.encontrada ?? '-'}
                  </Text>
                </View>
                
                {/* 4. Columna Ajustada: Llama a tableCell (Centrado) + Color Verde */}
                <View style={styles.colPres}>
                  <Text style={[styles.tableCell, { color: '#059669', fontWeight: 'bold' }]}>
                    {tp.ajustada ?? '-'}
                  </Text>
                </View>

              </View>
            ))
          ) : (
            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 8, color: '#94a3b8', textAlign: 'center' }}>
                No se registraron mediciones de presión.
              </Text>
            </View>
          )}
        </View>





{/* ==========================================
            SECCIÓN: VERIFICACIÓN DE CONDICIONES
           ========================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. Verificación de Condiciones Especiales y de Control</Text>
          </View>

          {/* Encabezado de la Tabla de Condiciones */}
          <View style={styles.cond_tableHeader}>
            <View style={styles.cond_colLabel}>
              <Text style={styles.cond_tableHeaderText}>Ítem / Condición Evaluada</Text>
            </View>
            <View style={styles.cond_colValue}>
              <Text style={[styles.cond_tableHeaderText, { textAlign: 'center' }]}>Resultado</Text>
            </View>
          </View>

          {/* Listado Dinámico de Condiciones */}
          {orderData?.condiciones_plantilla && orderData.condiciones_plantilla.length > 0 ? (
            orderData.condiciones_plantilla.map((cond: any, index: number) => {
              const isLast = index === orderData.condiciones_plantilla.length - 1;
              
              return (
                <View 
                  key={cond.id || index} 
                  style={isLast ? styles.cond_tableRowLast : styles.cond_tableRow}
                >
                  {/* Nombre de la condición (Muestra ambos si es especial) */}
                  <View style={styles.cond_colLabel}>
                    <Text style={styles.cond_textLabel}>
                      {cond.label}
                    </Text>
                    
                    {/* 🔥 Si es especial, pintamos el mensaje complementario abajo */}
                    {cond.is_special && cond.special_condition_label && (
                      <Text style={styles.cond_textSpecialLabel}>
                        Nota: {cond.special_condition_label}
                      </Text>
                    )}
                  </View>

                  {/* Evaluación del Badge de Estado */}
                  <View style={styles.cond_colValue}>
                    {cond.value === 'cumple' ? (
                      <Text style={styles.badgeCumple}>Cumple</Text>
                    ) : (
                      <Text style={styles.badgeNoAplica}>No Aplica</Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 8, color: '#64748b', textAlign: 'center' }}>
                No hay condiciones configuradas para esta plantilla de inspección.
              </Text>
            </View>
          )}
        </View>



{/* ==========================================
            SECCIÓN: OBSERVACIONES DE LA INSPECCIÓN
           ========================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>5. Observaciones / Novedades de la Orden</Text>
          </View>

          {orderData?.observaciones && orderData.observaciones.trim() !== "" ? (
            <View style={styles.observacionesContainer}>
              <Text style={styles.observacionesText}>
                {orderData.observaciones}
              </Text>
            </View>
          ) : (
            <View style={styles.observacionesContainer}>
              <Text style={styles.observacionesVacias}>
                No se registraron observaciones ni novedades durante el ingreso del vehículo.
              </Text>
            </View>
          )}
        </View>




{/* ==========================================
            SECCIÓN: TÉRMINOS Y CONDICIONES CONTRACTUALES
           ========================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>6. Declaración y Clausulado Contractual</Text>
          </View>

          {orderData?.texto_contractual_snapshot && orderData.texto_contractual_snapshot.trim() !== "" ? (
            <View style={styles.contratoContainer}>
              <Text style={styles.contratoText}>
                {orderData.texto_contractual_snapshot}
              </Text>
            </View>
          ) : (
            <View style={styles.contratoContainer}>
              <Text style={styles.contratoVacio}>
                No se constatan cláusulas contractuales específicas anexas a esta orden de entrada.
              </Text>
            </View>
          )}
        </View>






      </Page>
    </Document>
  );
}