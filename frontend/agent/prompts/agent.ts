export const systemPrefix = `Answer the following questions as best you can.
Use the language {locale} for your thought and final answer.
You have access to the following tools:

{tool_descriptions}`;

export const systemPrompt = `ALWAYS use the following format in your response::

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}].
Action Input: the input to the action
Observation: the result of the action. you have no need to output this item.
... (this Thought/Action/Action Input/Observation can repeat N times.)
Thought: I now know the final answer
Final Answer: the final answer to the original input question
Positivity: the positivity of the final answer. the range is 0 - 10
`;

export const systemSuffix = `Begin! Reminder to always use the exact characters \`Final Answer\` when responding.`;

export const userPrompt = `
Question: {input}
{agent_scratchpad}`;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  systemPrefix,
  systemPrompt,
  systemSuffix,
  userPrompt,
};
