import { google } from "@ai-sdk/google";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

export const geminiProModel = wrapLanguageModel({
  model: google("gemini-1.5-pro-002"),
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: google("gemini-1.5-flash-002"),
  middleware: customMiddleware,
});

// Gemini 2 models
export const gemini25ProPreviewModel = wrapLanguageModel({
  model: google("gemini-2.5-pro-preview-03-25"),
  middleware: customMiddleware,
});

export const gemini20FlashModel = wrapLanguageModel({
  model: google("gemini-2.0-flash"),
  middleware: customMiddleware,
});

export const gemini20FlashImageGenModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-exp-image-generation"),
  middleware: customMiddleware,
});

export const gemini20FlashLiteModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-lite"),
  middleware: customMiddleware,
});

export const gemini20FlashThinkingModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21"),
  middleware: customMiddleware,
});
