import { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../context/socketcontext"; 
import { useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast"; 

// --- Date & Time Formatters ---
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateSeparator = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const MessageContainer = ({ selectedUser, authUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const { socket } = useSocketContext();
  const navigate = useNavigate(); 
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(import.meta.env.VITE_SERVER_DOMAIN+`/api/messages/${selectedUser._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          }
        });
        
        if (response.status === 401) {
          toast.error("Session expired.");
          navigate("/login");
          return;
        }

        const data = await response.json();
        if (response.ok) setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUser, navigate]); 

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId === selectedUser?._id || newMessage.receiverId === selectedUser?._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(import.meta.env.VITE_SERVER_DOMAIN+`/api/messages/send/${selectedUser._id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, data]);
        setInputText(""); 
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-400 transition-colors duration-300">
        <div className="text-7xl mb-4 opacity-20">💬</div>
        <p className="text-xl font-bold text-slate-500 dark:text-slate-400">Select a connection to start chatting</p>
      </div>
    );
  }

  const groupedMessages = [];
  let currentDate = null;

  messages.forEach(msg => {
    const msgDate = formatDateSeparator(msg.createdAt);
    if (msgDate !== currentDate) {
      groupedMessages.push({ type: 'separator', date: msgDate, id: `sep-${msg._id}` });
      currentDate = msgDate;
    }
    groupedMessages.push({ type: 'message', data: msg });
  });

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-slate-900 transition-colors duration-300">
      
      {/* Header */}
      <div className="px-4 md:px-6 py-3 bg-[#f0f2f5] dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 md:gap-4 shadow-sm z-10 transition-colors">
        <button 
          onClick={onBack}
          className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center overflow-hidden shrink-0 text-white font-bold shadow-sm">
          {selectedUser.profilePic ? (
            <img src={selectedUser.profilePic} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{selectedUser.fullName.charAt(0)}</span>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-900 dark:text-white truncate transition-colors">{selectedUser.fullName}</span>
          <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium truncate transition-colors">
            {selectedUser.jobRole || "Alumni Connection"}
          </span>
        </div>
      </div>

      {/* Messages Area - WhatsApp Background Style */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2 bg-[#efeae2] dark:bg-slate-950/20 custom-scrollbar">
        {groupedMessages.map((item, index) => {
          
          if (item.type === 'separator') {
            return (
              <div key={item.id} className="flex justify-center my-6">
                <span className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-colors uppercase tracking-wider">
                  {item.date}
                </span>
              </div>
            );
          }

          const msg = item.data;
          const isSender = msg.senderId === (authUser._id || authUser.id);
          
          return (
            <div 
              key={msg._id} 
              className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-1`}
            >
              <div 
                className={`relative px-3 py-1.5 shadow-sm max-w-[85%] md:max-w-[70%] break-words transition-all
                  ${isSender 
                    ? "bg-[#dcf8c6] dark:bg-blue-600 text-slate-900 dark:text-white rounded-lg rounded-tr-none border border-[#c7e9b0] dark:border-blue-500" 
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg rounded-tl-none border border-slate-100 dark:border-slate-700" 
                  }
                `}
              >
                <p className="text-sm md:text-[15px] pr-12 leading-relaxed">{msg.message}</p>
                
                <span className={`text-[9px] absolute bottom-1 right-2 font-bold uppercase tracking-tighter opacity-70 ${isSender ? 'text-green-700 dark:text-blue-100' : 'text-slate-400'}`}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-[#f0f2f5] dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2 items-end transition-colors">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-4 py-1 transition-colors flex items-center shadow-sm">
          <textarea
            className="flex-1 border-none bg-transparent py-2 text-sm md:text-base outline-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none max-h-32 min-h-[40px] transition-colors"
            placeholder="Type a message..."
            value={inputText}
            rows="1"
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
            inputText.trim() 
              ? "bg-[#00a884] hover:bg-[#008f6f] text-white shadow-md active:scale-90 cursor-pointer" 
              : "bg-slate-300 dark:bg-slate-700 text-slate-100 dark:text-slate-500 cursor-not-allowed"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageContainer;