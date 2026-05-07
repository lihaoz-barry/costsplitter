"use client";

// pdf.js is loaded only in the browser. The worker is fetched from the same
// CDN the original prototype used, pinned to whatever pdfjs-dist version is
// installed in package.json.

let _setup = false;

export async function extractPdfText(file: File): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import("pdfjs-dist");
  if (!_setup) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    _setup = true;
  }
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = content.items.map((it: any) => it.str).join(" ");
    pages.push(text);
  }
  return pages.join("\n\n");
}
