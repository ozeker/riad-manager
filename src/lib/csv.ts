type CsvValue = string | number | boolean | null | undefined

export type CsvRow = Record<string, CsvValue>

function csvCell(value: CsvValue) {
  const text = String(value ?? "")
  return `"${text.replaceAll('"', '""')}"`
}

export function toCsv(rows: CsvRow[], headers = rows[0] ? Object.keys(rows[0]) : []) {
  if (headers.length === 0) {
    return ""
  }

  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ]

  return lines.join("\r\n")
}
