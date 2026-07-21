import * as XLSX from "xlsx";

export interface ParsedRecord {
    row: number;
    data: Record<string, unknown>;
}

export function parseImportFile(buffer: ArrayBuffer): ParsedRecord[] {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: "",
    });

    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => String(h).toLowerCase().trim());

    return rows.slice(1).map((row, index) => {
        const data: Record<string, unknown> = {};
        headers.forEach((header, i) => {
            data[header] = row[i];
        });
        return { row: index + 2, data };
    });
}

export function getString(record: Record<string, unknown>, key: string): string {
    const value = record[key];
    if (value === undefined || value === null) return "";
    return String(value).trim();
}
