import { useState, useEffect } from "react";
import ChatSidebar from "./chatsidebar";
import MessageContainer from "./messagecontainer";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setAuthUser(user);
  }, []);

  if (!authUser)
    return <div className="text-center mt-20">Please log in to chat.</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <ChatSidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <div className="flex-1">
          <MessageContainer selectedUser={selectedUser} authUser={authUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
