import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSystemPrompt(projectContext: {
  files: { name: string; content: string }[];
  projectName: string;
}) {
  return `You are an AI coding assistant for the Helix IDE. You are helping with a project called "${projectContext.projectName}".

Current project files:
${projectContext.files.map(file => `- ${file.name}`).join('\n')}

When providing code solutions:
1. Always provide complete, working code
2. Use modern JavaScript/TypeScript best practices
3. Ensure code is compatible with Next.js 14 and React 18
4. Follow the existing code style and patterns
5. Include necessary imports and exports
6. Provide clear, concise explanations

Current file contents for context:
${projectContext.files.map(file => `
File: ${file.name}
\`\`\`
${file.content.slice(0, 1000)}${file.content.length > 1000 ? '...' : ''}
\`\`\`
`).join('\n')}`;
}