"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";
import { ArrowDownIcon } from "lucide-react";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
    });

  const [messagesContainerRef, messagesEndRef, shouldAutoScroll, forceScrollToBottom] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="pb-20 pt-4 relative w-full flex flex-col h-dvh">
      <div
        ref={messagesContainerRef}
        className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        data-auto-scroll={shouldAutoScroll ? "true" : "false"}
      >
        {messages.length === 0 && <Overview />}
        {messages.map((message) => (
          <PreviewMessage
            key={message.id}
            chatId={id}
            role={message.role}
            content={message.content}
            attachments={message.experimental_attachments}
            toolInvocations={message.toolInvocations}
          />
        ))}
        <div
          ref={messagesEndRef}
          className="h-px w-full"
        />
      </div>

      {!shouldAutoScroll && messages.length > 0 && (
        <button 
          onClick={forceScrollToBottom}
          className="fixed bottom-24 right-4 z-10 rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-opacity hover:opacity-90"
          aria-label="Scroll to bottom"
        >
          <ArrowDownIcon size={16} />
        </button>
      )}

      <div className="px-4 fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 py-4 sm:pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
        <div className="w-full md:max-w-[500px] mx-auto">
          <MultimodalInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            stop={stop}
            attachments={[]}
            setAttachments={() => {}}
            messages={messages}
            append={append}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
