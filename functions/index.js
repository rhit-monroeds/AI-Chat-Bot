const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const OpenAI = require('openai');

const openaiApiKey = functions.config().openai.key;
const client = new OpenAI({
  apiKey: openaiApiKey,
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
  
    async function fallback(agent) {
      const userMessage = agent.query;
  
      try {
        const completion = await client.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: userMessage },
          ],
        });
  
        const aiResponse = completion.data.choices[0].message.content.trim();
        agent.add(aiResponse);
      } catch (error) {
        console.error('Error with OpenAI API call:', error);
        agent.add("I'm sorry, but I'm having trouble processing your request right now.");
      }
    }
  
    let intentMap = new Map();
    intentMap.set('Default Fallback Intent', fallback);
  
    agent.handleRequest(intentMap);
  });