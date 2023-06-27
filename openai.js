import { Configuration, OpenAIApi } from "openai";

function configureOpenAi(apiKey) {
	const configuration = new Configuration({ apiKey: apiKey });
	return new OpenAIApi(configuration);
}

export default configureOpenAi;
