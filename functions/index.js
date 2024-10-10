const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function welcome(agent) {
    agent.add('Welcome to my AI-powered chatbot!');
  }

  function fallback(agent) {
    agent.add("I'm sorry, I didn't understand that.");
    agent.add('Can you please rephrase?');
  }

  function bookFlight(agent) {
    agent.add('Sure, I can help you book a flight. Where are you flying to?');
  }

  function orderPizza(agent) {
    agent.add('Sure, I can help you order a pizza. What toppings would you like on it?');
  }

  function reserveTable(agent) {
    agent.add('Sure, I can help you reserve a table. Which restaurant would you like a reservation for?');
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('BookFlight', bookFlight);
  intentMap.set('OrderPizza', orderPizza);
  intentMap.set('ReserveTable', reserveTable);

  agent.handleRequest(intentMap);
});
