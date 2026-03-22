export function buildContext(files: Record<string, string>): string {
  if (Object.keys(files).length === 0) return '';
  let context = 'Current project files:\n\n';
  for (const [path, content] of Object.entries(files)) {
    context += `// filepath: ${path}\n${content}\n\n`;
  }
  return context;
}
