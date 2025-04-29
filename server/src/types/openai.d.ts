declare module 'openai' {
  export interface OpenAI {
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: Array<{
            role: 'system' | 'user' | 'assistant';
            content: string;
          }>;
          temperature?: number;
          max_tokens?: number;
        }): Promise<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }

  export function OpenAI(apiKey: string): OpenAI;
} 