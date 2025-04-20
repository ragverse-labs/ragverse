import { ChatBody, Conversation } from '@/types/chat';
import { z } from 'zod';
// import { createRouter } from '../path-to-your-router'; // Adjust path accordingly
import { procedure, router } from '../trpc';
import { OPENAI_API_HOST } from '@/utils/app/const';
// The original fetch-based chat service within the Docker network

export const chatService = async ({ body }: { body: {  content: string }[] }) => {
  // const baseUrl = `${process.env.OPENAI_API_HOST}/api/v1/chat/chat`; // Use environment variable for API
  let baseUrl = `${OPENAI_API_HOST}/chat/chat`;
  // Send the array of messages as the payload
  // console.log("its chatting..." + baseUrl);
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }), // Send the array of messages in the payload
  });
  // console.log(response.statusText);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data = await response.json();
  // console.log("came this far...");
  // console.log(data);
  return data; // Return the response (e.g., the Message object)
};


// export const chatService = async ({ body }: { body: { message: string } }) => {
//   const baseUrl = `${process.env.OPENAI_API_HOST}/api/v1/chat/chat`; // Use environment variable for API

//   const response = await fetch(baseUrl, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ body }), // Send the body as the payload
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch: ${response.statusText}`);
//   }

//   const data = await response.json();
//   return data; // Return the response (e.g., the Message object)
// };

export const chats = router({
  update: procedure
    .input(
      z.object({
        body: z.array(
          z.object({
            // role: z.enum(["system", "assistant", "user"]),
            content: z.string(),
          })
        ), // Now `body` expects an array of objects with role and content
      })
    )
    .mutation(async ({ input }) => {
      const { body } = input;
      const result = await chatService({ body }); // Process the array of messages in chatService
      return result; // Return the result of the chat service
    }),
});

// export const chats = router({
//   update: procedure
//     .input(
//       z.object({
//         body: z.object({
//           message: z.string(),
//           // Add any other fields necessary here if needed
//         }),
//       })
//     )
//     .mutation(async ({ input }) => {
//       const { body } = input; // Now only handling the body, no conversation
//       const result = await chatService({ body }); // Pass only the body to chatService
//       return result; // Return the result from chatService
//     }),
// });