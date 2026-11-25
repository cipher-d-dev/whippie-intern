import type { Metadata } from "next";
import { ChatListScreen } from "./ChatListScreen";

export const metadata: Metadata = { title: "Chats · Whippie" };

export default function ChatPage() {
  return <ChatListScreen />;
}
