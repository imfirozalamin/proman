import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import { FiSend, FiLoader } from "react-icons/fi";

const ChatBot = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchInitialConversation = async () => {
      try {
        const response = await fetch("/api/chatbot/conversations", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        if (data.length > 0) {
          setConversationId(data[0]._id);
          const convResponse = await fetch(
            `/api/chatbot/conversations/${data[0]._id}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          const convData = await convResponse.json();
          setConversation(convData.messages);
        }
      } catch (error) {
        console.error("Failed to fetch conversation history:", error);
      }
    };

    if (user) fetchInitialConversation();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: message };
    setConversation((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          message,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      setConversation(data.messages);
      setConversationId(data.conversationId);
    } catch (error) {
      toast.error("Failed to get chatbot response");
      console.error("Chatbot error:", error);
      setConversation((prev) =>
        prev.filter((msg) => msg.role !== "user" || msg.content !== message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition
      show={true}
      enter="transition-all duration-300 ease-out"
      enterFrom="opacity-0 scale-95 translate-y-4"
      enterTo="opacity-100 scale-100 translate-y-0"
      leave="transition-all duration-200 ease-in"
      leaveFrom="opacity-100 scale-100 translate-y-0"
      leaveTo="opacity-0 scale-95 translate-y-4"
      className="fixed bottom-24 right-6 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-red-500 text-white">
        <h3 className="text-lg font-semibold">ProMan AiAssist</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Close chatbot"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
        {conversation.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-lg">How can I help you today?</p>
            <p className="text-sm mt-2">
              Ask me about tasks, projects, or productivity tips!
            </p>
          </div>
        ) : (
          conversation
            .filter((msg) => msg.role !== "system")
            .map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md break-words ${
                    msg.role === "user"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
      >
        <div className="flex gap-2 items-center">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-10 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="h-10 w-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <FiLoader className="animate-spin w-5 h-5" />
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ProMan may produce inaccurate information about tasks and projects.
        </p>
      </form>
    </Transition>
  );
};

export default ChatBot;
