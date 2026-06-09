// @ts-expect-error - React import required at runtime by @react-pdf/renderer
import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { z } from 'zod'
import { DataTable } from '../pdf/components/dataTable'

interface OrderItem extends Record<string, unknown> {
  product: string
  description: string
  quantity: number
  price: number
  total: number
}

const spaceString = z.string().transform((val) => val || ' ')
const optionalString = z.string().transform((val) => val || null)

const orderDataSchema = z.object({
  company: z.object({
    name: spaceString,
    displayName: spaceString,
    address: spaceString,
    postCode: spaceString,
    phone: spaceString,
  }),
  delivery: z.object({
    dayText: spaceString,
    longDate: spaceString,
    shortDate: spaceString,
    deliveryTime: optionalString,
    deliveryLeaveDoor: optionalString,
    deliveryLeaveNeighbour: optionalString,
  }),
  sender: z.object({
    name: spaceString,
    address: spaceString,
    postCode: spaceString,
    phone: spaceString,
    company: spaceString,
  }),
  receiver: z.object({
    name: spaceString,
    company: spaceString,
    co: spaceString,
    address: spaceString,
    postCode: spaceString,
    phone: spaceString,
  }),
  card: z.object({
    cardText: optionalString,
    instructionsText: optionalString,
  }),
  orderContent: z.array(
    z.object({
      product: z.string(),
      description: z.string().optional().default(''),
      quantity: z.number(),
      price: z.number(),
      total: z.number(),
    }),
  ),
})

export type OrderData = z.input<typeof orderDataSchema>

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
    minHeight: 60,
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
  driverLeaveInfo: {
    gap: 8,
    marginTop: 4,
  },
  driverLeaveBG: {
    padding: 2,
    backgroundColor: '#f0f0f0',
  },
  pageNumbers: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 10,
  },
})

export const OrderPage = ({ data }: { data: OrderData }) => {
  const {
    company: {
      name: companyName,
      displayName: companyDisplayName,
      address: companyAddress,
      postCode: companyPostCode,
      phone: companyPhone,
    },
    delivery: {
      dayText,
      longDate,
      shortDate,
      deliveryTime,
      deliveryLeaveDoor,
      deliveryLeaveNeighbour,
    },
    sender: {
      name: senderName,
      address: senderAddress,
      postCode: senderPostCode,
      phone: senderPhone,
      company: senderCompany,
    },
    receiver: {
      name: receiverName,
      company: receiverCompany,
      co: receiverCO,
      address: receiverAddress,
      postCode: receiverPostCode,
      phone: receiverPhone,
    },
    card: { cardText, instructionsText },
    orderContent: orderContentData,
  } = orderDataSchema.parse(data)

  return (
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View fixed style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.logo}>{companyDisplayName}</Text>
          <Text style={styles.title}>Ordre</Text>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.date}>
            {dayText} {longDate}
          </Text>
          {deliveryTime ? <Text>Levering før {deliveryTime}</Text> : null}
        </View>
      </View>

      {/* SENDER INFO */}
      <View fixed style={styles.senderInfo}>
        <View style={[styles.container, styles.textGapSmall]}>
          <Text style={styles.senderTitle}>Sender:</Text>
          <Text style={[styles.senderName, styles.textGap]}>{senderName}</Text>
          <Text>
            {senderAddress}, {senderPostCode}
          </Text>
        </View>
        <View style={[styles.container, styles.textGapSmall]}>
          <Text style={styles.textGap}>Telefon: {senderPhone}</Text>
          <Text>Firma: {senderCompany}</Text>
        </View>
      </View>

      {/* ORDER CONTENTS */}
      <DataTable
        data={orderContentData as OrderItem[]}
        style={styles.orderContent}
        columns={[
          {
            key: 'product',
            header: 'Vare',
            render: (row) => (
              <View>
                <Text>{row.product}</Text>
                {row.description ? (
                  <Text style={{ fontSize: 9, color: '#666', marginTop: 1 }}>
                    {row.description}
                  </Text>
                ) : null}
              </View>
            ),
          },
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
      {cardText || instructionsText ? (
        <View
          wrap={false}
          style={[styles.rowContainer, styles.smallGap, { marginTop: 8 }]}
        >
          <View style={styles.container}>
            <Text style={styles.heading}>Korttekst</Text>
            <View style={styles.textBoxContainer}>
              <Text>{cardText}</Text>
            </View>
          </View>

          <View style={styles.container}>
            <Text style={styles.heading}>Spesielle Instrukser</Text>
            <View style={styles.textBoxContainer}>
              <Text>{instructionsText}</Text>
            </View>
          </View>
        </View>
      ) : null}

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
              <Text>{companyName}</Text>
              <Text>{companyAddress}</Text>
              <Text>{companyPostCode}</Text>
              <Text style={styles.textGapLarge}>{companyPhone}</Text>

              <Text>{shortDate}</Text>
              <Text style={styles.textGapLarge}>
                {deliveryTime ? `Før ${deliveryTime}` : ' '}
              </Text>

              <Text>{receiverName}</Text>
              <Text>{receiverCompany}</Text>
              <Text>{receiverCO}</Text>
              <Text>{receiverAddress}</Text>
              <Text>{receiverPostCode}</Text>
              <Text>{receiverPhone}</Text>
            </View>
          </View>

          {/* INFO VALUES BOTTOM */}
          <View style={[styles.rowContainer, styles.driverLeaveInfo]}>
            <View style={[styles.rowContainer, styles.driverLeaveBG]}>
              <Text>Dør: </Text>
              <Text>{deliveryLeaveDoor}</Text>
            </View>

            <View style={[styles.rowContainer, styles.driverLeaveBG]}>
              <Text>Nabo: </Text>
              <Text>{deliveryLeaveNeighbour}</Text>
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
              <Text>{companyName}</Text>
              <Text>{companyAddress}</Text>
              <Text>{companyPostCode}</Text>
              <Text style={styles.textGapLarge}>{companyPhone}</Text>

              <Text>{shortDate}</Text>
              <Text style={styles.textGapLarge}>
                {deliveryTime ? `Før ${deliveryTime}` : ' '}
              </Text>

              <Text>{receiverName}</Text>
              <Text>{receiverCompany}</Text>
              <Text>{receiverCO}</Text>
              <Text>{receiverAddress}</Text>
              <Text>{receiverPostCode}</Text>
              <Text>{receiverPhone}</Text>
            </View>
          </View>

          {/* INFO VALUES BOTTOM */}
          <View style={[styles.rowContainer, styles.driverLeaveInfo]}>
            <View style={[styles.rowContainer, styles.driverLeaveBG]}>
              <Text>Dør: </Text>
              <Text>{deliveryLeaveDoor}</Text>
            </View>

            <View style={[styles.rowContainer, styles.driverLeaveBG]}>
              <Text>Nabo: </Text>
              <Text>{deliveryLeaveNeighbour}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text
        style={styles.pageNumbers}
        render={({ pageNumber, totalPages }) =>
          totalPages != 1 && `${pageNumber} / ${totalPages}`
        }
        fixed
      />
    </Page>
  )
}

// Create Document Component
const OrderDocument = ({ data }: { data: OrderData }) => (
  <Document>
    <OrderPage data={data} />
  </Document>
)

export { OrderDocument }
