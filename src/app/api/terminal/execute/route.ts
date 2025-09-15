import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Allowed commands for security
const ALLOWED_COMMANDS = [
  'ls', 'dir', 'pwd', 'echo', 'cat', 'type', 'npm', 'node', 'git',
  'mkdir', 'touch', 'cd', 'whoami', 'date', 'clear', 'help'
];

const BLOCKED_COMMANDS = [
  'rm', 'del', 'rmdir', 'sudo', 'su', 'chmod', 'chown',
  'kill', 'killall', 'reboot', 'shutdown', 'format'
];

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid command' },
        { status: 400 }
      );
    }

    // Basic security check
    const commandParts = command.trim().split(' ');
    const baseCommand = commandParts[0].toLowerCase();

    // Check for blocked commands
    if (BLOCKED_COMMANDS.some(blocked => baseCommand.includes(blocked))) {
      return NextResponse.json({
        success: false,
        error: 'Command not allowed for security reasons'
      });
    }

    // Handle built-in commands
    if (baseCommand === 'help') {
      return NextResponse.json({
        success: true,
        output: `Available commands:
- ls/dir: List files
- pwd: Show current directory  
- echo [text]: Display text
- npm [command]: NPM commands
- node [file]: Run Node.js files
- git [command]: Git commands
- mkdir [name]: Create directory
- date: Show current date
- clear: Clear terminal`
      });
    }

    if (baseCommand === 'clear') {
      return NextResponse.json({
        success: true,
        output: 'Terminal cleared'
      });
    }

    // Execute the command with timeout
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 10000, // 10 second timeout
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'development' }
      });

      return NextResponse.json({
        success: true,
        output: stdout || stderr || 'Command executed successfully'
      });
    } catch (execError: any) {
      return NextResponse.json({
        success: false,
        error: execError.message || 'Command execution failed'
      });
    }

  } catch (error) {
    console.error('Terminal API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}