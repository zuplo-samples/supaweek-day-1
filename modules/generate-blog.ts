import { ZuploContext, ZuploRequest, Logger } from "@zuplo/runtime";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { createClient } from "@supabase/supabase-js";
import { CompletionCreateParams } from "openai/resources/chat";
import OpenAI from "openai";
import { environment } from "@zuplo/runtime";

export const openai = new OpenAI({
  apiKey: environment.OPENAI_API_KEY || "",
});

export const supabase = createClient(
  environment.SUPABASE_PROJECT_URL || "",
  environment.SUPABASE_SERVICE_ROLE_KEY || ""
);


const functions: CompletionCreateParams.Function[] = [
  {
    name: "blogpost",
    description: "A blog post and title",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content of the blog post",
        },
        title: {
          type: "string",
          description: "The title of the blog post",
        },
      },
      required: ["content", "title"],
    },
  },
];

export default async function (request: ZuploRequest, context: ZuploContext) {
  const { topic } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    stream: true,
    messages: [
      {
        role: "user",
        content: `Give me a 100 blog about the following topic ${topic}.`,
      },
    ],
    functions,
  });

  const stream = OpenAIStream(
    response
    //   , {
    //   // this is so we don't block the response from being sent to the client
    //   // while we save the blog to the database
    //   onCompletion: async (completion) => {
    //     await saveBlogtoDatabase(completion, context.log);
    //   },
    // }
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}