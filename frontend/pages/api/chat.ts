import { ensureHasValidSession, getUserHash } from '@/utils/server/auth';
import { getErrorResponseBody } from '@/utils/server/error';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import loggerFn from 'pino';
import { PassThrough } from 'stream';
import { authOptions } from './auth/[...nextauth]';
import { getTiktokenEncoding } from '@/utils/server/tiktoken';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { createMessagesToSend } from '@/utils/server/message';
import { ChatBodySchema } from '@/types/chat';
import { OpenAIStream } from '@/utils/server';
const logger = loggerFn({ name: 'chat' });
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await ensureHasValidSession(req, res))) {
    return res.status(401).json({ error: 'Please log in to start conversing.. ' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (session && process.env.AUDIT_LOG_ENABLED === 'true') {
      logger.info({ event: 'chat', user: session.user });
    }

    const userId = await getUserHash(req, res);
    const { model, messages, key, prompt, temperature } = ChatBodySchema.parse(req.body);
    const encoding = await getTiktokenEncoding(model.id);

    let systemPromptToSend = prompt || DEFAULT_SYSTEM_PROMPT;
    let { messages: messagesToSend, maxToken } = createMessagesToSend(
      encoding,
      model,
      systemPromptToSend,
      1000,
      messages,
    );

    const response = await OpenAIStream(model, systemPromptToSend, temperature, key, messagesToSend, maxToken);

    // Use a PassThrough stream as a passthrough mechanism
    const passThroughStream = new PassThrough();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Ensure headers are sent early

    // Pipe the OpenAI response body to the PassThrough stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      (async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            passThroughStream.end(); // Close the PassThrough stream
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          passThroughStream.write(chunk);
          // console.log("Received chunk:", chunk);
          // Handle end condition if the stream indicates it's done
          if (chunk.includes("[DONE]")) {
            passThroughStream.end();
            break;
          }
        }
      })().catch((error) => {
        console.error("Error in passthrough stream:", error);
        passThroughStream.destroy(error); // Close the stream on error
      });
    }

    // Pipe the PassThrough stream directly to the response
    passThroughStream.pipe(res);

  } catch (error) {
    console.error("Error during streaming:", error);
    const errorRes = getErrorResponseBody(error);
    res.status(500).json(errorRes);
  }
};
export default handler;
