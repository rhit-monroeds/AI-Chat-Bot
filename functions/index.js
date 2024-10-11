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
            let conversationHistory = agent.context.get('conversation')?.parameters?.history || [];
            conversationHistory.push({ role: 'user', content: userMessage });
            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: conversationHistory
              });
              const aiResponse = completion.choices[0].message.content.trim();
              conversationHistory.push({ role: 'assistant', content: aiResponse });
              agent.context.set({
                name: 'conversation',
                lifespan: 50,
                parameters: { history: conversationHistory },
              });
              agent.add(aiResponse);
              console.log(aiResponse);
            } catch (error) {
              console.error('OpenAI API call error:', error);
              agent.add("I'm sorry, I can't process your request right now.");
            }
        }
        let intentMap = new Map();
        intentMap.set('Default Fallback Intent', fallback);
        agent.handleRequest(intentMap);
    }
 ); 