const { WebhookClient } = require('dialogflow-fulfillment');
const OpenAI = require('openai');
const { defineSecret } = require('firebase-functions/params');
const { onInit } = require('firebase-functions/v2/core');
const { onRequest } = require('firebase-functions/v2/https');

const openaiApiKey = defineSecret('OPENAI_API_KEY');
let openai;
onInit(() => {
  openai = new OpenAI({
    apiKey: openaiApiKey.value(),
  });
});

exports.dialogflowFirebaseFulfillment = onRequest(
    { secrets: [openaiApiKey] },
    async (request, response) => {
        const agent = new WebhookClient({ request, response });
        async function fallback(agent) {
            const userMessage = agent.query;
            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  { role: 'system', content: 'You are a helpful assistant.' },
                  { role: 'user', content: userMessage },
                ],
              });
              const aiResponse = completion.choices[0].message.content.trim();
              agent.add(aiResponse);
              console.log(aiResponse);
            } catch (error) {
              console.error('Error with OpenAI API call:', error);
              agent.add("I'm sorry, but I'm having trouble processing your request right now.");
            }
        }
        let intentMap = new Map();
        intentMap.set('Default Fallback Intent', fallback);
        agent.handleRequest(intentMap);
    }
 ); 