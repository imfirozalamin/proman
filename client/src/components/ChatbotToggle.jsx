import { useState } from "react";
import Chatbot from "./ChatBot";
import { IoChatbubbleEllipses } from "react-icons/io5";

const ChatbotToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <Chatbot onClose={() => setIsOpen(false)} />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-40"
        aria-label="Chatbot toggle"
      >
        {isOpen ? "✕" : <IoChatbubbleEllipses className="w-6 h-6" />}
      </button>
    </>
  );
};

export default ChatbotToggle;
