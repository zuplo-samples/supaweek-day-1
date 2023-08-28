import { ZuploContext, ZuploRequest, environment } from "@zuplo/runtime";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: environment.OPENAI_API_KEY || "",
});

export default async function (request: ZuploRequest, context: ZuploContext) {
  const { prompt } = await request.json();

  const response = await openai.completions.create({
    model: "text-davinci-003",
    stream: true,
    temperature: 0.6,
    max_tokens: 300,
    prompt: `
    Create a 300 word blog post about the following topic:
    Business: ${prompt}
  `,
  });

  return new StreamingTextResponse(OpenAIStream(response));
}
