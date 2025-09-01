import * as XLSX from "xlsx";

export function toCSV(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    const needs = /[",\n\r]/.test(s);
    const d = s.replace(/"/g, '""');
    return needs ? `"${d}"` : d;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    const rec = r as Record<string, unknown>
    lines.push(headers.map((h) => esc(rec[h])).join(","))
  }
  return lines.join("\r\n");
}

export function downloadBlob(filename: string, mime: string, data: string | Uint8Array) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCSV(filename: string, rows: Array<Record<string, unknown>>) {
  downloadBlob(filename, "text/csv;charset=utf-8", toCSV(rows));
}

export function exportXLSX(filename: string, sheets: Record<string, Array<Record<string, unknown>>>) {
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    if (!rows.length) continue;
    const headers = Object.keys(rows[0]);
    const data = [headers, ...rows.map((r) => {
      const rec = r as Record<string, unknown>
      return headers.map((h) => rec[h] ?? "")
    })];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  XLSX.writeFile(wb, filename);
}

export async function exportChart(node: HTMLElement, filename: string, format: 'svg'|'png' = 'png') {
  const svg = node.querySelector('svg') as SVGSVGElement | null
  if (!svg) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svg)
  if (format === 'svg') {
    downloadBlob(filename.endsWith('.svg') ? filename : `${filename}.svg`, 'image/svg+xml', svgStr)
    return
  }
  // PNG: draw svg to canvas
  const img = new Image()
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = svg.viewBox.baseVal.width || svg.clientWidth
  canvas.height = svg.viewBox.baseVal.height || svg.clientHeight
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.drawImage(img, 0, 0)
  URL.revokeObjectURL(url)
  const dataUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
