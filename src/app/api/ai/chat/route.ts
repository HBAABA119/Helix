import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSystemPrompt } from '@/lib/utils';

// Use the provided Google AI API key directly
const genAI = new GoogleGenerativeAI('AIzaSyAmwt5GH5j59SMm9zskINTuBSijQD5on8c');

export async function POST(request: NextRequest) {
  try {
    const { message, context, model = 'gemini-pro' } = await request.json();

    // Generate system prompt based on project context
    const systemPrompt = generateSystemPrompt(context);

    let response = '';

    try {
      // Use Google Gemini model
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `${systemPrompt}\n\nUser: ${message}`;
      const result = await geminiModel.generateContent(prompt);
      const geminiResponse = await result.response;
      
      response = geminiResponse.text();
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      response = 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.';
    }

    // Check if response contains code that should be applied to files
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2],
      });
    }

    return NextResponse.json({
      response,
      codeBlocks,
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