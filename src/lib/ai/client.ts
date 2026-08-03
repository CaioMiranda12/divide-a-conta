import { createOpenAI } from "@ai-sdk/openai";
import { ocrConfig } from "@/config/ocr";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ocrModel = openai(ocrConfig.model);