import { NextApiRequest, NextApiResponse } from 'next';

import { ensureHasValidSession, getUserHash } from '@/utils/server/auth';
import { getTiktokenEncoding } from '@/utils/server/tiktoken';
import { cleanSourceText } from '@/utils/server/webpage';

import { Message } from '@/types/chat';
import { GoogleBody, GoogleSource } from '@/types/google';

import { Tiktoken } from 'tiktoken/lite/init';
import { Readability } from '@mozilla/readability';
import endent from 'endent';
import jsdom, { JSDOM } from 'jsdom';
import path from 'node:path';
import { getOpenAIApi } from '@/utils/server/openai';
import { OpenAIError } from '@/utils/server';
import { getErrorResponseBody } from '@/utils/server/error';
import { saveLlmUsage, verifyUserLlmUsage } from '@/utils/server/llmUsage';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  // Vercel Hack
  // https://github.com/orgs/vercel/discussions/1278
  // eslint-disable-next-line no-unused-vars
  // const vercelFunctionHack = path.resolve('./public', '');

  if (!(await ensureHasValidSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = await getUserHash(req, res);

  let encoding: Tiktoken | null = null;
  try {
    const { messages, key, model, googleAPIKey, googleCSEId } =
      req.body as GoogleBody;
    try {
      await verifyUserLlmUsage(userId, model.id);
    } catch (e: any) {
      return res.status(429).json({ error: e.message });
    }

    encoding = await getTiktokenEncoding(model.id);

    const userMessage = messages[messages.length - 1];
    const query = encodeURIComponent(userMessage.content.trim());

    const googleRes = await fetch(
      `https://customsearch.googleapis.com/customsearch/v1?key=${googleAPIKey ? googleAPIKey : process.env.GOOGLE_API_KEY
      }&cx=${googleCSEId ? googleCSEId : process.env.GOOGLE_CSE_ID
      }&q=${query}&num=5`,
    );

    const googleData = await googleRes.json();

    const sources: GoogleSource[] = googleData.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      displayLink: item.displayLink,
      snippet: item.snippet,
      image: item.pagemap?.cse_image?.[0]?.src,
      text: '',
    }));

    const textDecoder = new TextDecoder();
    const sourcesWithText: any = await Promise.all(
      sources.map(async (source) => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 5000),
          );

          const res = (await Promise.race([
            fetch(source.link),
            timeoutPromise,
          ])) as any;

          // if (res) {
          const html = await res.text();

          const virtualConsole = new jsdom.VirtualConsole();
          virtualConsole.on('error', (error) => {
            if (!error.message.includes('Could not parse CSS stylesheet')) {
              console.error(error);
            }
          });

          const dom = new JSDOM(html, { virtualConsole });
          const doc = dom.window.document;
          const parsed = new Readability(doc).parse();

          if (parsed) {
            let sourceText = cleanSourceText(parsed.textContent);

            // 400 tokens per source
            let encodedText = encoding!.encode(sourceText);
            if (encodedText.length > 400) {
              encodedText = encodedText.slice(0, 400);
            }
            return {
              ...source,
              text: textDecoder.decode(encoding!.decode(encodedText)),
            } as GoogleSource;
          }
          // }

          return null;
        } catch (error) {
          console.error(error);
          return null;
        }
      }),
    );

    const filteredSources: GoogleSource[] = sourcesWithText.filter(Boolean);
    let sourceTexts: string[] = [];
    let tokenSizeTotal = 0;
    for (const source of filteredSources) {
      const text = endent`
      ${source.title} (${source.link}):
      ${source.text}
      `;
      const tokenSize = encoding.encode(text).length;
      if (tokenSizeTotal + tokenSize > 2000) {
        break;
      }
      sourceTexts.push(text);
      tokenSizeTotal += tokenSize;
    }

    const answerPrompt = endent`
    Provide me with the information I requested. Use the sources to provide an accurate response. Respond in markdown format. Cite the sources you used as a markdown link as you use them at the end of each sentence by number of the source (ex: [[1]](link.com)). Provide an accurate response and then stop. Today's date is ${new Date().toLocaleDateString()}.

    Example Input:
    What's the weather in San Francisco today?

    Example Sources:
    [Weather in San Francisco](https://www.google.com/search?q=weather+san+francisco)

    Example Response:
    It's 70 degrees and sunny in San Francisco today. [[1]](https://www.google.com/search?q=weather+san+francisco)

    Input:
    ${userMessage.content.trim()}

    Sources:
    ${sourceTexts}

    Response:
    `;

    const answerMessage: Message = { role: 'user', content: answerPrompt };
    const openai = getOpenAIApi(model.azureDeploymentId);
    let answerRes;
    try {
      answerRes = await openai.createChatCompletion({
        model: model.id,
        messages: [
          {
            role: 'system',
            content: `Use the sources to provide an accurate response. Respond in markdown format. Cite the sources you used as [1](link), etc, as you use them. Maximum 4 sentences.`,
          },
          answerMessage,
        ],
        max_tokens: 1000,
        temperature: 1,
        stream: false,
      })
    } catch (error: any) {
      if (error.response) {
        const { message, type, param, code } = error.response.data.error;
        throw new OpenAIError(message, type, param, code)
      } else throw error
    }

    const { choices: choices2, usage } = await answerRes.data;
    const answer = choices2[0].message!.content;

    await saveLlmUsage(userId, model.id, "google", {
      prompt: usage?.prompt_tokens ?? 0,
      completion: usage?.completion_tokens ?? 0,
      total: usage?.total_tokens ?? 0
    })

    res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    const errorRes = getErrorResponseBody(error);
    res.status(500).json(errorRes);
  } finally {
    if (encoding !== null) {
      encoding.free();
    }
  }
};

export default handler;
