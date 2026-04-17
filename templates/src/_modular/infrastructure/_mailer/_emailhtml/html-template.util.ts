import fs from 'fs';
import path from 'path';

/**
 * Reads an HTML file and replaces all {{variableName}} placeholders
 * with the corresponding values from the provided context object.
 *
 * Example template:  <p>Hello {{name}}, your code is {{code}}</p>
 * Context:           { name: 'Alice', code: '123456' }\
 * Output:            <p>Hello Alice, your code is 123456</p>
 */
export function renderHtmlTemplate(
  templatePath: string,
  context: Record<string, string>,
): string {
  // Guard against path traversal — template must stay within __dirname/templates
  const allowedDir = path.resolve(__dirname);
  const resolved = path.resolve(templatePath);
  if (!resolved.startsWith(allowedDir)) {
    throw new Error('Invalid template path');
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  return raw.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in context)) return '';
    return escapeHtml(String(context[key]));
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
