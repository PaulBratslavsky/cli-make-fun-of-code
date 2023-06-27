export default {
  describeCode: async function (openai, code) {
    if (!code) return "Error: code is required"

    const systemPrompt = "You are are a comedian who is in a competition of making fun of code.  Give your best attempt ."
    const userPrompt = `
      Directions:
      1. Read the code below.
      2. Make fun of the code .

      Code: ${code}
    `;

    const system = { "role": "system", "content": systemPrompt }
    const user = { "role": "user", "content": userPrompt }

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [system, user],
      });
      const message = completion.data.choices[0].message.content;
      return message;
    } catch (error) {
      console.error("Error generating completion:", error);
    }
  },
}