import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { DataTable } from '../pdf/components/dataTable'

const orderContentData = [
  { product: 'Roser', quantity: 1, price: 79, total: 79 },
  { product: 'Tulipaner', quantity: 2, price: 69, total: 138 },
  { product: 'Liljer', quantity: 2, price: 109, total: 218 },
  { product: 'Blomsteropsatts Høst', quantity: 1, price: 250, total: 250 },
  { product: 'Potte Stor', quantity: 2, price: 120, total: 240 },
  { product: 'Potte Liten', quantity: 2, price: 69, total: 138 },
  {
    product: 'Veldig langt varenavn som skal teste hva som skjer',
    quantity: 1,
    price: 100,
    total: 100,
  },
  { product: 'Krans', quantity: 3, price: 140, total: 420 },
  { product: 'Frakt', quantity: 1, price: 100, total: 100 },
  { product: 'Tidspunkt Tillegg', quantity: 1, price: 100, total: 100 },
]

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    fontSize: 11,
  },
  container: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    fontSize: 11,
    lineHeight: 1.2,
  },
  textBoxContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    minHeight: 120,
    fontSize: 10,
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    borderBottom: '0.5px solid #ccc',
    marginVertical: 10,
  },
  smallGap: {
    gap: 20,
  },
  bigGap: {
    gap: 60,
  },
  textGap: {
    marginBottom: 2,
  },
  textGapLarge: {
    marginBottom: 4,
  },
  textGapSmall: {
    marginBottom: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  rightHeader: {
    flex: 1,
    textAlign: 'right',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 14,
    width: 70,
    paddingRight: 5,
    borderRight: '1px solid #ccc',
  },
  title: {
    fontSize: 18,
    alignSelf: 'center',
    paddingLeft: 5,
  },
  date: {
    fontSize: 12,
    marginBottom: 2,
  },
  senderInfo: {
    backgroundColor: '#f0f0f0',
    marginTop: 4,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  senderTitle: {
    fontSize: 10,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderContent: {
    flex: 1,
    marginVertical: 8,
  },
  driverInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
})

// Create Document Component
const OrderDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.logo}>Blomster i Byhaven</Text>
          <Text style={styles.title}>Ordre</Text>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.date}>Mandag 31. August</Text>
          <Text>Levering før 14:00</Text>
        </View>
      </View>

      {/* SENDER INFO */}
      <View style={styles.senderInfo}>
        <View style={[styles.container, styles.textGapSmall]}>
          <Text style={styles.senderTitle}>Sender:</Text>
          <Text style={[styles.senderName, styles.textGap]}>Navn Navnesen</Text>
          <Text>Adressegate 24, 7000 Trondheim</Text>
        </View>
        <View style={[styles.container, styles.textGapSmall]}>
          <Text style={styles.textGap}>Telefon: +4712345678</Text>
          <Text>Firma: EksempelFirma AS</Text>
        </View>
      </View>

      {/* ORDER CONTENTS */}
      <DataTable
        data={orderContentData}
        style={styles.orderContent}
        columns={[
          { key: 'product', header: 'Produkt' },
          {
            key: 'quantity',
            header: 'Antall',
            width: '60',
            align: 'right',
          },
          {
            key: 'price',
            header: 'Pris',
            width: '80',
            align: 'right',
            prefix: 'Kr ',
          },
          {
            key: 'total',
            header: 'Total',
            width: '80',
            align: 'right',
            prefix: 'Kr ',
          },
        ]}
        footer={{
          product: 'Totalt Beløp',
          total: orderContentData.reduce((acc, item) => acc + item.total, 0),
        }}
      />

      {/* CARD AND INSTRUCTIONS INFO */}
      <View wrap={false} style={[styles.rowContainer, styles.smallGap]}>
        <View style={styles.container}>
          <Text style={styles.heading}>Korttekst</Text>
          <View style={styles.textBoxContainer}>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
              dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit.
            </Text>
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.heading}>Spesielle Instruksjoner</Text>
          <View style={styles.textBoxContainer}>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
          </View>
        </View>
      </View>

      {/* DRIVER DELIVERY INFO */}
      <View style={styles.divider} />
      <View
        wrap={false}
        style={[styles.rowContainer, styles.bigGap, { marginTop: 20 }]}
      >
        {/* LEFT CONTAINER */}
        <View style={styles.container}>
          <Text style={styles.heading}>Kjørelapp 1</Text>
          <View style={styles.driverInfo}>
            {/* INFO KEYS (LEFT) */}
            <View>
              <Text>Utfører:</Text>
              <Text>Adresse:</Text>
              <Text>Postnr/Sted:</Text>
              <Text style={styles.textGapLarge}>Telefon:</Text>

              <Text>Lev. Dato:</Text>
              <Text style={styles.textGapLarge}>Lev. Tid:</Text>

              <Text>Mottaker:</Text>
              <Text>Firma:</Text>
              <Text>C/O:</Text>
              <Text>Adresse:</Text>
              <Text>Postnr/Sted:</Text>
              <Text>Telefon:</Text>
            </View>

            {/* INFO VALUES (RIGHT) */}
            <View style={styles.container}>
              <Text>Blomster i Byhaven AS</Text>
              <Text>Olav Tryggvasonsgt. 28</Text>
              <Text>7011 Trondheim</Text>
              <Text style={styles.textGapLarge}>73522460</Text>

              <Text>2026-08-31</Text>
              <Text style={styles.textGapLarge}>Før 14:00</Text>

              <Text>Kari Nordmann</Text>
              <Text> </Text>
              <Text> </Text>
              <Text>Ingensteds 55</Text>
              <Text>7089 Heimdal</Text>
              <Text>+4787654321</Text>
            </View>
          </View>
        </View>

        {/* RIGHT CONTAINER */}
        <View style={styles.container}>
          <Text style={styles.heading}>Kjørelapp 2</Text>
          <View style={styles.driverInfo}>
            {/* INFO KEYS (LEFT) */}
            <View>
              <Text>Utfører:</Text>
              <Text>Adresse:</Text>
              <Text>Postnr/Sted:</Text>
              <Text style={styles.textGapLarge}>Telefon:</Text>

              <Text>Lev. Dato:</Text>
              <Text style={styles.textGapLarge}>Lev. Tid:</Text>

              <Text>Mottaker:</Text>
              <Text>Firma:</Text>
              <Text>C/O:</Text>
              <Text>Adresse:</Text>
              <Text>Postnr/Sted:</Text>
              <Text>Telefon:</Text>
            </View>

            {/* INFO VALUES (RIGHT) */}
            <View style={styles.container}>
              <Text>Blomster i Byhaven AS</Text>
              <Text>Olav Tryggvasonsgt. 28</Text>
              <Text>7011 Trondheim</Text>
              <Text style={styles.textGapLarge}>73522460</Text>

              <Text>2026-08-31</Text>
              <Text style={styles.textGapLarge}>Før 14:00</Text>

              <Text>Kari Nordmann</Text>
              <Text> </Text>
              <Text> </Text>
              <Text>Ingensteds 55</Text>
              <Text>7089 Heimdal</Text>
              <Text>+4787654321</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)

export { OrderDocument }
