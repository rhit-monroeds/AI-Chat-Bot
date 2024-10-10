// functions/src/index.ts

import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import OpenAI from 'openai';

const openaiApiKey = functions.config().openai.key;
const client = new OpenAI({
    apiKey: openaiApiKey
  });

export const dialogflowFirebaseFulfillment = functions.https.onRequest(async (request, response) => {
  const agent = new WebhookClient({ request, response });

  async function fallback(agent: WebhookClient) {
    const userMessage = agent.query;

    try {
      const chatCompletion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userMessage },
        ]
      });
      const choice = chatCompletion.choices[0];

      if (choice.message && choice.message.content) {
        const aiResponse = choice.message.content.trim();
        agent.add(aiResponse);
      } else {
        agent.add("I'm sorry, I didn't receive a response.");
      }
    } catch (error) {
      console.error('Error with OpenAI API call:', error);
      agent.add("I'm sorry, but I'm having trouble processing your request right now.");
    }
  }

  const intentMap = new Map<string, (agent: WebhookClient) => Promise<void> | void>();
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});
