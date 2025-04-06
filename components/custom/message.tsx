"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { RecipeList } from "../recipes/recipe-list";
import { RecipeDetail } from "../recipes/recipe-detail";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  // Flag to check if the message content should be hidden
  // (when we're displaying a recipe card and the message is just repeating the recipe)
  const [hideContent, setHideContent] = useState(false);

  // Check if we're displaying a recipe and the text is redundant
  useEffect(() => {
    if (toolInvocations && content && typeof content === "string") {
      // Check if any tool invocation is a recipe detail
      const hasRecipeDetail = toolInvocations.some(
        (tool) => tool.toolName === "getRecipeDetails" && tool.state === "result"
      );

      if (hasRecipeDetail) {
        // Look for common patterns that indicate text is just repeating recipe details
        const lowerContent = content.toLowerCase();
        const isRecipeRepeat =
          (lowerContent.includes("ingredients:") && lowerContent.includes("instructions:")) ||
          (lowerContent.includes("here's the recipe") && lowerContent.includes("ingredients")) ||
          // @ts-ignore
          ( lowerContent?.match(/\d+\s*(tbsp|tsp|cup|g|oz|lb|kg)/g)?.length > 3); // Multiple measurement units

        setHideContent(isRecipeRepeat);
      }
    }
  }, [toolInvocations, content]);

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>
      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && !hideContent && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {/* Display brief intro message when hiding duplicate content */}
        {hideContent && (
          <div className="text-zinc-800 dark:text-zinc-300 text-sm italic">
            Here's the recipe you requested:
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;
              if (state === "result") {
                const { result } = toolInvocation;
                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : toolName === "searchRecipes" ? (
                      <RecipeList chatId={chatId} results={result} />
                    ) : toolName === "getRecipeDetails" ? (
                      <RecipeDetail recipe={result} />
                    ) : toolName === "findRecipeVideo" ? (
                      <div className="text-xs text-muted-foreground">
                        This information is now included in the recipe details.
                      </div>
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "searchRecipes" ? (
                      <RecipeList chatId={chatId} />
                    ) : toolName === "getRecipeDetails" ? (
                      <RecipeDetail />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}
        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
