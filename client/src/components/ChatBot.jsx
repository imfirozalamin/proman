import React, { useState, useEffect, useRef } from "react";
import { IoChatbubbleEllipses, IoSend, IoClose } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const OPENROUTER_API_KEY =
    "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";

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Keyword check to simulate task creation response
    if (
      /(create|add|make)\s+a\s+task/i.test(input) ||
      /high\s+priority/i.test(input) ||
      /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i.test(
        input
      )
    ) {
      setTimeout(() => {
        const botMessage = {
          role: "assistant",
          content:
            "I've created a task based on your request. Due date and priority have been set accordingly.",
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [...messages, { role: "user", content: input }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      const botMessage = {
        role: "assistant",
        content: data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const botMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="bg-red-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h2 className="font-bold">ProMan AiAssist</h2>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
              aria-label="Close Chat"
            >
              <IoClose size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                Start a conversation with the AI assistant
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-red-100 ml-auto"
                      : "bg-gray-100 mr-auto"
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Updated input UI */}
          <div className="p-3 border-t border-gray-200">
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="
                  flex-grow
                  resize-y
                  min-h-[38px]
                  max-h-24
                  rounded-full
                  border
                  border-red-600
                  px-4
                  py-2
                  text-gray-900
                  placeholder-red-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-500
                  focus:border-red-500
                  scrollbar-thin
                  scrollbar-thumb-red-300
                "
                rows={1}
                aria-label="Chat input"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="
                  ml-2
                  flex
                  items-center
                  justify-center
                  rounded-full
                  bg-red-600
                  hover:bg-red-700
                  disabled:bg-red-300
                  p-3
                  transition
                "
                aria-label="Send message"
              >
                {isLoading ? (
                  <ImSpinner8 className="animate-spin text-white" />
                ) : (
                  <IoSend className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all"
          aria-label="Open Chat"
        >
          <IoChatbubbleEllipses size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatBot;
