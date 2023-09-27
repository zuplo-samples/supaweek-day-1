import { ZuploContext, ZuploRequest, Logger } from "@zuplo/runtime";
import { openai } from "./services/openai";
import { supabase } from "./services/supabase";
import openaiCreateBlogSchema from "../schemas/openai-create-blog-schema.json";
import { CompletionCreateParams } from "openai/resources/chat";

const functions: CompletionCreateParams.Function[] = [
  {
    name: "blogpost",
    description: "A blog post and title",
    parameters: openaiCreateBlogSchema,
  },
];

export default async function (request: ZuploRequest, context: ZuploContext) {
  const { topic } = await request.json();

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "user",
        content: `Give me a 100 words blog about the following topic ${topic}.`,
      },
    ],
    functions,
  });

  const blogResult = chatCompletion.choices[0].message.function_call!.arguments;

  const savedData = await saveBlogtoDatabase(blogResult, context.log);

  return new Response(JSON.stringify(savedData), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

type CreatedBlogSchema = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

const saveBlogtoDatabase = async (
  blog: string,
  logger: Logger
): Promise<CreatedBlogSchema | null> => {
  try {
    const { content, title } = JSON.parse(blog);

    const { data, error } = await supabase
      .from("blogs")
      .insert({ content, title })
      .select();

    if (error || data === null || data.length === 0) {
      logger.error(error || "No data returned from database");
      return null;
    }

    return data[0] as CreatedBlogSchema;
  } catch (err) {
    logger.error(err);
    return null;
  }
};
