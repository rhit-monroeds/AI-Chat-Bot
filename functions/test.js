// this script is used to ensure that the OpenAI API is working and correctly returning messages

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: "",
});

async function testOpenAI() {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello!' }],
    });

    console.log(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API call error:', error);
  }
}

testOpenAI();