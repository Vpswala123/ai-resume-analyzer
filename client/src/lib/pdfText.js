import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

function groupItemsIntoLines(items) {
  const textItems = items
    .filter((item) => item.str?.trim())
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
    }))
    .sort((left, right) => {
      if (Math.abs(right.y - left.y) > 2) {
        return right.y - left.y;
      }

      return left.x - right.x;
    });

  const lines = [];

  textItems.forEach((item) => {
    const lastLine = lines.at(-1);

    if (!lastLine || Math.abs(lastLine.y - item.y) > 2) {
      lines.push({ y: item.y, parts: [item] });
      return;
    }

    lastLine.parts.push(item);
  });

  return lines
    .map((line) =>
      line.parts
        .sort((left, right) => left.x - right.x)
        .map((part) => part.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageLines = groupItemsIntoLines(content.items);
    pageTexts.push(pageLines.join("\n"));
  }

  return pageTexts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
