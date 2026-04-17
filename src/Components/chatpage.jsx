import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext"; 
import ChatSidebar from "./chatsidebar";
import MessageContainer from "./messagecontainer"; 

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: authUser } = useContext(UserContext); 

  if (!authUser) return null; // App.jsx AuthRoute will handle redirecting if missing

  return (
    // Outer Wrapper with Dark Mode backgrounds
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900 pt-4 px-2 md:px-4 pb-4 transition-colors duration-300 font-sans">
      
      {/* Main App Container */}
      <div className="flex w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-lg dark:shadow-slate-900/50 overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        {/* SIDEBAR WRAPPER 
          - Mobile: Full width. Hidden if a chat is selected.
          - Desktop: Fixed width (w-80 or w-96). Always visible.
        */}
        <div className={`h-full border-r border-slate-200 dark:border-slate-700 transition-colors duration-300 ${
          selectedUser ? 'hidden md:block' : 'w-full'
        } md:w-80 lg:w-96 shrink-0`}>
          <ChatSidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
        
        {/* MESSAGE CONTAINER WRAPPER 
          - Mobile: Full width. Hidden if NO chat is selected.
          - Desktop: Takes up remaining space (flex-1). Always visible.
        */}
        <div className={`flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 relative z-0 ${
          !selectedUser ? 'hidden md:flex' : 'flex w-full'
        }`}>
          <MessageContainer 
            selectedUser={selectedUser} 
            authUser={authUser} 
            // We pass a function to clear the selected user so they can hit "Back" on mobile
            onBack={() => setSelectedUser(null)} 
          />
        </div>
        
      </div>
    </div>
  );
};

export default ChatPage;