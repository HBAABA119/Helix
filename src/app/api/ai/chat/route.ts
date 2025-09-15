import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Google Gemini configuration
const genAI = new GoogleGenerativeAI('AIzaSyAmwt5GH5j59SMm9zskINTuBSijQD5on8c');

export async function POST(request: NextRequest) {
  try {
    const { message, context, model = 'nvidia/llama-3.1-nemotron-nano-4b-v1.1', conversationHistory = [] } = await request.json();

    // Generate system prompt based on project context
    const systemPrompt = `You are Helix AI, an expert coding assistant. Be conversational, direct, and helpful like a skilled developer colleague.

CORE BEHAVIOR:
- Talk naturally - "I'll", "Let me", "Here's" - like a human developer
- Be concise and action-oriented
- NO thinking process, reasoning, or explanations unless asked
- Create/edit files silently without announcing it
- Take immediate action when users ask for features

FILE OPERATIONS:
Create files quietly with:
\`\`\`[language]
// [filepath]
[code]
\`\`\`

Update existing files with:
\`\`\`[language]
// [filepath] - UPDATE
[updated code]
\`\`\`

Read files when needed:
\`\`\`read-file
[filepath]
\`\`\`

TERMINAL COMMANDS:
\`\`\`terminal
[command]
\`\`\`

EXAMPLES:
User: "Make a button component"
You: "I'll create a button component for you."

\`\`\`tsx
// src/components/Button.tsx
export function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      {children}
    </button>
  );
}
\`\`\`

User: "Add TypeScript types"
You: "I'll add proper TypeScript interfaces."

\`\`\`ts
// src/types/common.ts
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}
\`\`\`

PROJECT CONTEXT:
Tech Stack: Next.js 15.5.3, TypeScript, Tailwind CSS, Firebase Auth
Files: ${context?.files?.map(f => `${f.name}`).join(', ') || 'None'}

RULES:
- Always be helpful and proactive
- Use TypeScript for everything
- Follow Tailwind CSS for styling
- Components go in src/components/
- Utilities in src/lib/
- Read existing files before modifying
- Install packages when needed
- No explanations unless requested
- Work like a senior developer

Be direct, efficient, and helpful!`;

    let response = '';

    try {
      // Use Google Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Build conversation history for context
      const contextMessages = conversationHistory.slice(-5).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');
      
      const fullPrompt = `${systemPrompt}

Conversation history:
${contextMessages}

User: ${message}`;
      
      const result = await model.generateContent(fullPrompt);
      response = result.response.text() || 'No response generated';
      
      // Remove any formal structure and robotic language
      response = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
      response = response.replace(/\*\*Reasoning:\*\*[\s\S]*?(?=\n\n|$)/gi, '');
      response = response.replace(/^.*?thinking.*?$/gmi, '');
      response = response.replace(/💻\s*CODING\s*MODE\s*ACTIVATED/gi, '');
      response = response.replace(/🗣️\s*CONVERSATION\s*MODE/gi, '');
      response = response.replace(/\*\*Explanation:\*\*/gi, '');
      response = response.replace(/\*\*Next Steps:\*\*/gi, '');
      response = response.replace(/^\s*-\s*.*$/gm, (match) => {
        // Only remove bullet points that look like formal explanations
        if (match.includes('file') || match.includes('HTML') || match.includes('CSS') || match.includes('JavaScript')) {
          return '';
        }
        return match;
      });
      response = response.trim();
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      response = 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.';
    }

    // Extract code blocks and commands
    const codeBlockRegex = /```(?:(\w+)\s*)?(?:\n|\r\n)?([\s\S]*?)```/g;
    const codeBlocks = [];
    const filesToCreate = [];
    const filesToUpdate = [];
    const filesToRead = [];
    const terminalCommands = [];
    let match;

    // Extract code blocks
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      // Check if it's a terminal command
      if (language === 'terminal' || language === 'bash' || language === 'cmd') {
        terminalCommands.push({
          command: code,
          language
        });
      } else if (language === 'read-file') {
        // File reading request
        filesToRead.push(code);
      } else {
        codeBlocks.push({
          language,
          code,
        });
      }
    }

    // Enhanced file creation and update instructions parsing
    const fileInstructionPatterns = [
      /(?:I'll create|I'll make|Creating|Let me create|I'll add|I'll build).*?(?:file|component|function|class|interface|hook|util|page|api|route).*?(?:at|in|to)\s+([^\s`"']+\.[a-zA-Z0-9]+)/gi,
      /(?:I'll update|I'll modify|I'll edit|Updating|Modifying).*?(?:file|component|function|class|interface|hook|util|page|api|route).*?(?:at|in|to)?\s*([^\s`"']+\.[a-zA-Z0-9]+)/gi,
      /(?:Here's|Here is)\s+(?:the|a|an)\s+.*?(?:file|component|function|class|interface|hook|util|page|api|route).*?(?:for|at|in|to)\s+([^\s`"']+\.[a-zA-Z0-9]+)/gi,
      /(?:Save this as|Put this in|Add this to)\s+([^\s`"']+\.[a-zA-Z0-9]+)/gi
    ];
    
    fileInstructionPatterns.forEach(pattern => {
      const fileMatches = response.matchAll(pattern);
      for (const fileMatch of fileMatches) {
        const filePath = fileMatch[1];
        const isUpdate = /(?:I'll update|I'll modify|I'll edit|Updating|Modifying)/i.test(fileMatch[0]);
        
        // Find the next code block after this instruction
        const instructionIndex = response.indexOf(fileMatch[0]);
        const nextCodeBlockStart = response.indexOf('```', instructionIndex);
        if (nextCodeBlockStart !== -1) {
          const correspondingCodeBlock = codeBlocks.find(block => {
            const blockIndex = response.indexOf('```' + block.language);
            return blockIndex >= nextCodeBlockStart;
          });
          
          if (correspondingCodeBlock) {
            if (isUpdate && !filesToUpdate.some(f => f.path === filePath)) {
              filesToUpdate.push({
                path: filePath,
                content: correspondingCodeBlock.code,
                language: correspondingCodeBlock.language
              });
            } else if (!isUpdate && !filesToCreate.some(f => f.path === filePath)) {
              filesToCreate.push({
                path: filePath,
                content: correspondingCodeBlock.code,
                language: correspondingCodeBlock.language
              });
            }
          }
        }
      }
    });

    // Auto-detect files from code blocks with common patterns
    codeBlocks.forEach((block, index) => {
      // Look for file path comments or JSX/component patterns
      const lines = block.code.split('\n');
      const firstLine = lines[0]?.trim();
      
      // Check for file path comments like // src/components/MyComponent.tsx
      const pathComment = firstLine?.match(/\/\/\s*([^\s]+\.[a-zA-Z0-9]+)/);
      if (pathComment && !filesToCreate.some(f => f.path === pathComment[1]) && !filesToUpdate.some(f => f.path === pathComment[1])) {
        filesToCreate.push({
          path: pathComment[1],
          content: block.code.replace(firstLine, '').trim(),
          language: block.language
        });
        return;
      }
      
      // Auto-detect based on language and content patterns
      let suggestedPath = '';
      if (block.language === 'tsx' || block.language === 'jsx') {
        const componentMatch = block.code.match(/(?:export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]+))|(?:function\s+([A-Z][A-Za-z0-9]+))/);;
        if (componentMatch) {
          const componentName = componentMatch[1] || componentMatch[2];
          suggestedPath = `src/components/${componentName}.${block.language}`;
        }
      } else if (block.language === 'ts' || block.language === 'js') {
        if (block.code.includes('export')) {
          // Try to extract meaningful name from exports
          const exportMatch = block.code.match(/export\s+(?:const|function)\s+([a-zA-Z][a-zA-Z0-9]+)/);
          if (exportMatch) {
            suggestedPath = `src/lib/${exportMatch[1]}.${block.language}`;
          } else {
            suggestedPath = `src/lib/utils.${block.language}`;
          }
        }
      } else if (block.language === 'css') {
        suggestedPath = `src/styles/generated.css`;
      } else if (block.language === 'json') {
        // Check if it's package.json content
        if (block.code.includes('\"dependencies\"') || block.code.includes('\"scripts\"')) {
          suggestedPath = 'package.json';
        } else if (block.code.includes('\"compilerOptions\"')) {
          suggestedPath = 'tsconfig.json';
        } else {
          suggestedPath = 'config.json';
        }
      } else if (block.language === 'html') {
        suggestedPath = 'index.html';
      } else if (block.language === 'md' || block.language === 'markdown') {
        suggestedPath = 'README.md';
      }
      
      if (suggestedPath && !filesToCreate.some(f => f.path === suggestedPath) && !filesToUpdate.some(f => f.path === suggestedPath)) {
        filesToCreate.push({
          path: suggestedPath,
          content: block.code,
          language: block.language
        });
      }
    });

    // Execute terminal commands if any
    const terminalResults = [];
    for (const terminalCmd of terminalCommands) {
      try {
        const { stdout, stderr } = await execAsync(terminalCmd.command, {
          timeout: 30000, // 30 second timeout
          cwd: process.cwd(),
          env: { ...process.env, NODE_ENV: 'development' }
        });
        
        terminalResults.push({
          command: terminalCmd.command,
          output: stdout || stderr || 'Command executed successfully',
          success: true
        });
      } catch (execError: any) {
        terminalResults.push({
          command: terminalCmd.command,
          output: execError.message || 'Command execution failed',
          success: false
        });
      }
    }

    // Handle file reading requests
    const fileReadResults = [];
    for (const filePath of filesToRead) {
      try {
        const { readFile } = await import('fs/promises');
        const { join } = await import('path');
        const { existsSync } = await import('fs');
        
        const projectRoot = process.cwd();
        const fullPath = join(projectRoot, filePath);
        
        if (existsSync(fullPath)) {
          const content = await readFile(fullPath, 'utf8');
          fileReadResults.push({
            path: filePath,
            content,
            success: true
          });
        } else {
          fileReadResults.push({
            path: filePath,
            content: '',
            success: false,
            error: 'File not found'
          });
        }
      } catch (error) {
        fileReadResults.push({
          path: filePath,
          content: '',
          success: false,
          error: 'Failed to read file'
        });
      }
    }

    // Handle file update requests
    const fileUpdateResults = [];
    for (const fileUpdate of filesToUpdate) {
      try {
        const { writeFile } = await import('fs/promises');
        const { join } = await import('path');
        
        const projectRoot = process.cwd();
        const fullPath = join(projectRoot, fileUpdate.path);
        
        await writeFile(fullPath, fileUpdate.content, 'utf8');
        
        fileUpdateResults.push({
          path: fileUpdate.path,
          success: true,
          message: 'File updated successfully'
        });
      } catch (error) {
        fileUpdateResults.push({
          path: fileUpdate.path,
          success: false,
          error: 'Failed to update file'
        });
      }
    }

    return NextResponse.json({
      response,
      codeBlocks,
      filesToCreate,
      filesToUpdate,
      fileReadResults,
      fileUpdateResults,
      terminalResults,
      model: model,
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request. Please try again.' },
      { status: 500 }
    );
  }
}