import type { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    const { data } = req.body;

    console.log("data", data)

    // Headers with merged group names
    const header = [
      ["ORDER NUMBER", "PROCESS TIME", "", "ASSY GROUP", "PART NO", "MODE", "TOTAL LENGTH", "STRIPPING LENGTH", "", "HALF STRIP LENGTH", "", "INSULATION", "", "CORE DIAMETER", "BLADE MOVE BLACK", "DEPTH OF BLADE", "LENGTH OF MB"],
      ["", "START", "FINISH", "", "", "", "", "FRONT", "REAR", "FRONT", "REAR", "FRONT", "REAR", "", "", "", ""],
    ];

    // Combine headers and data
    const worksheetData = [...header, ...data];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge cells for headers
    worksheet["!merges"] = [
      //COLUMN MERGE
      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }, // PROCESS TIME span 2 cols
      { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, // STRIPPING LENGTH span 2 cols
      { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } }, // HALF STRIP LENGTH span 2 cols
      { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } }, // INSULATION span 2 cols

      //ROW MERGE
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // ORDER NUMBER
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // ASSY GROUP
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // PART NO
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // MODE
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // TOTAL LENGTH
      { s: { r: 0, c: 13 }, e: { r: 1, c: 13 } }, // CORE DIAMETER
      { s: { r: 0, c: 14 }, e: { r: 1, c: 14 } }, // BLADE MOVE BLACK
      { s: { r: 0, c: 15 }, e: { r: 1, c: 15 } }, // DEPTH OF BLADE
      { s: { r: 0, c: 16 }, e: { r: 1, c: 16 } }, // LENGTH OF MB

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
