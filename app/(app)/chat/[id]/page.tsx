import { ChatThreadScreen } from "./ChatThreadScreen";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatThreadScreen id={id} />;
}
