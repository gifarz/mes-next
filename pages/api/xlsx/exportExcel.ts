import type { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    const { data } = req.body;

    console.log("data", data)

    // Headers with merged group names
    const header = [
      ["STATION", "SHIFT", "OPERATOR", "PROCESS TIME", "", "ORDER NUMBER", "PART CODE", "TOTAL LENGTH", "STRIPPING LENGTH", "", "OUTPUT QUANTITY", "", "QC", ""],
      ["", "", "", "START", "FINISH", "", "", "", "FRONT", "REAR", "PLAN", "ACT", "QC", "CHECKER"],
    ];

    // Combine headers and data
    const worksheetData = [...header, ...data];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge cells for headers
    worksheet["!merges"] = [
      //COLUMN MERGE
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // PROCESS TIME span 2 cols
      { s: { r: 0, c: 8 }, e: { r: 0, c: 9 } }, // STRIPPING LENGTH span 2 cols
      { s: { r: 0, c: 10 }, e: { r: 0, c: 11 } }, // OUTPUT QUANTITY span 2 cols
      { s: { r: 0, c: 12 }, e: { r: 0, c: 13 } }, // QC span 2 cols

      //ROW MERGE
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // STATION
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // SHIFT
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // OPERATOR
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // ORDER NUMBER
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // PART CODE
      { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } }, // TOTAL LENGTH

    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Process Data");

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader("Content-Disposition", "attachment; filename=process-data.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send file
    res.send(buffer);

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
