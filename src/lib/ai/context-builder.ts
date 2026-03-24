export function buildContext(files: Record<string, string>): string {
  const boilerplate = `ENVIRONMENT INFO:
- Tailwind CSS is pre-loaded via CDN in index.html. Use utility classes (e.g. bg-slate-900, backdrop-blur, p-6).
- Entry point: src/App.tsx. Ensure this file exists and serves as the main application component.
- Icons: NO external icon libraries. Use inline SVGs.
- Packages: Only 'react' and 'react-dom' are available.

`;
  if (Object.keys(files).length === 0) return boilerplate;
  let context = boilerplate + 'Current project files:\n\n';
  for (const [path, content] of Object.entries(files)) {
    context += `// filepath: ${path}\n${content}\n\n`;
  }
  return context;
}
