import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import {
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { ApiError, ApiErrorBody, ErrorResponseCode } from '@/types/error';

export class OpenAIError extends ApiError {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }

  getApiError(): ApiErrorBody {
    let errorCode: ErrorResponseCode;
    switch (this.code) {
      case "429":
        errorCode = ErrorResponseCode.OPENAI_RATE_LIMIT_REACHED;
        break;
      case "503":
        errorCode = ErrorResponseCode.OPENAI_SERVICE_OVERLOADED;
        break;
      default:
        errorCode = ErrorResponseCode.ERROR_DEFAULT;
        break;
    }
    return { error: { code: errorCode, message: this.message } };
  }
}

interface PromptProps {
  systemPrompt: string;
  fromLang: string;
  toLang: string;
  bookName: string;
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature: number,
  key: string,
  messages: Message[],
  maxTokens: number,
) => {
  let url = `${OPENAI_API_HOST}/chat/chat`;
  //  let url = `https://ourvedas.in/v1/chat/chat`
  console.log("its chat... " + url);

  //  v1/chat/completions;
  // if (OPENAI_API_TYPE === 'azure') {
  //   url = `${OPENAI_API_HOST}/openai/deployments/${model.azureDeploymentId}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  // }
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(OPENAI_API_TYPE === 'openai' && {
        Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
      }),
      ...(OPENAI_API_TYPE === 'azure' && {
        'api-key': `${key ? key : process.env.OPENAI_API_KEY}`,
      }),
      ...(OPENAI_API_TYPE === 'openai' &&
        OPENAI_ORGANIZATION && {
          'OpenAI-Organization': OPENAI_ORGANIZATION,
        }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(OPENAI_API_TYPE === 'openai' && { model: model.id }),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  if (res.status !== 200) {
   
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

return res;
 
};
