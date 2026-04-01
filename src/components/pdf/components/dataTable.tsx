import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

interface DataTableColumn<T> {
  key: keyof T & string
  header: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  prefix?: string
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[]
  data: T[]
  footer?: Partial<Record<keyof T & string, string | number>>
  style?: Style
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  headerRow: {
    fontSize: 12,
  },
  cell: {
    padding: 6,
    fontSize: 11,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  footerCell: {
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
  },
})

function colSizeStyle(width?: string | number): Style {
  return width != null ? { width } : { flex: 1 }
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  footer,
  style,
}: DataTableProps<T>) {
  return (
    <View style={[styles.table, ...(style ? [style] : [])]}>
      <View style={[styles.row, styles.headerRow]}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.cell,
              styles.headerCell,
              { ...colSizeStyle(col.width), textAlign: col.align ?? 'left' },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>

      {data.map((row, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: no row id available
        <View key={i} style={styles.row}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[
                styles.cell,
                { ...colSizeStyle(col.width), textAlign: col.align ?? 'left' },
              ]}
            >
              {row[col.key] != null
                ? `${col.prefix ?? ''}${String(row[col.key])}`
                : ''}
            </Text>
          ))}
        </View>
      ))}

      {footer && (
        <View style={styles.row}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[
                styles.cell,
                styles.footerCell,
                { ...colSizeStyle(col.width), textAlign: col.align ?? 'left' },
              ]}
            >
              {footer[col.key] != null
                ? `${col.prefix ?? ''}${String(footer[col.key])}`
                : ''}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}
