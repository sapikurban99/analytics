/**
 * Helper to export generic data array into a downloadable CSV file.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  data: T[],
  columns: { key: string; header: string }[]
) {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  // 1. Generate Headers row
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");

  // 2. Generate Data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const val = item[col.key];
        
        if (val === null || val === undefined) {
          return '""';
        }
        
        // Format values nicely
        let strVal = "";
        if (typeof val === "number") {
          strVal = String(val);
        } else {
          strVal = String(val).replace(/"/g, '""');
        }
        
        return `"${strVal}"`;
      })
      .join(",");
  });


  // 3. Combine header and rows
  const csvContent = [headers, ...rows].join("\n");

  // 4. Create Blob with BOM for excel compatibility
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  
  // 5. Trigger browser download
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
