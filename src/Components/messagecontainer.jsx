import { useState, useEffect } from "react";
import { useSocketContext } from "../context/socketcontext"; 
import { useNavigate } from "react-router-dom"; // <-- Added for redirect
import toast from "react-hot-toast"; // <-- Added for user feedback

const MessageContainer = ({ selectedUser, authUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const { socket } = useSocketContext();
  const navigate = useNavigate(); // <-- Initialize navigate

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
        
        // --- NEW 401 CHECK ---
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        // --------------------

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
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser?._id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    return () => socket.off("newMessage");
  }, [socket, selectedUser, setMessages]);

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

      // --- NEW 401 CHECK ---
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      // --------------------

      const data = await response.json();
      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, data]);
        setInputText(""); 
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!selectedUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 font-semibold bg-white border-l">Select a connection to start chatting</div>;
  }

  return (
    <div className="message-container flex flex-col h-full bg-white border-l">
      <div className="header p-4 bg-gray-50 border-b font-bold text-gray-800 flex items-center gap-3">
        {selectedUser.profilePic ? (
          <img src={selectedUser.profilePic} alt={selectedUser.fullName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {selectedUser.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <span>{selectedUser.fullName}</span>
      </div>

      <div className="messages-window flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">Say hi to {selectedUser.fullName}!</div>
        )}
        {messages.map((msg) => (
          <div 
            key={msg._id} 
            className={`p-3 rounded-2xl max-w-xs md:max-w-md break-words ${
              msg.senderId === (authUser._id || authUser.id)
                ? "bg-blue-600 text-white self-end rounded-br-none" 
                : "bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm"       
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 p-3 rounded-full outline-none focus:border-blue-500 bg-gray-50"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageContainer;