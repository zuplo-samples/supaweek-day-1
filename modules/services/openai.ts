import OpenAI from "openai";
import { environment } from "@zuplo/runtime";

export const openai = new OpenAI({
  apiKey: environment.OPENAI_API_KEY || "",
  organization: null,
});
