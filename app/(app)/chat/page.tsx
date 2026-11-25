import type { Metadata } from "next";
import { ChatScreen } from "./ChatScreen";

export const metadata: Metadata = { title: "Chat with HR · Whippie" };

export default function ChatPage() {
  return <ChatScreen />;
}
