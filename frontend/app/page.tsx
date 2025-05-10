import { Chat } from "@/components/chat"

export default function Home() {
  return (
    <main className="flex h-screen w-full items-center justify-center p-0 sm:p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <Chat />
    </main>
  )
}
