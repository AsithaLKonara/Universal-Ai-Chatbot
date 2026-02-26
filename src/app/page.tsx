import { ChatWidget } from "@/components/chat-widget";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 bg-white dark:bg-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">OmniChat AI Foundation</h1>
        <p className="mt-4 text-zinc-500 text-lg">Universal Context-Aware Chatbot Platform</p>
      </div>
      <ChatWidget />
    </main>
  );
}
