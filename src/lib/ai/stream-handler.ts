export function parseFilesFromStream(text: string): Record<string, string> {
  const files: Record<string, string> = {};
  // Match // filepath: path OR // file: path OR // File: path
  const regex = /\/\/\s*(?:filepath|file):\s*(.+?)\n([\s\S]*?)(?=\/\/\s*(?:filepath|file):|$)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const filePath = match[1].trim();
    let fileContent = match[2].trim();

    // Strip markdown code fences if the AI wrapped output in backticks
    fileContent = fileContent
      .replace(/^```(?:tsx?|jsx?|typescript|javascript|css|html|json)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    if (filePath && fileContent) {
      files[filePath] = fileContent;
    }
  }
  return files;
}
