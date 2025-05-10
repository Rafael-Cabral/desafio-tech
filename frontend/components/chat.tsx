"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Send, Loader2, Trash2, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type Message = { text: string; from: "user" | "bot"; timestamp: Date }

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Backend URL - using environment variables with fallback
  const BACKEND_URL = typeof window !== 'undefined' ? 
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001") :
    "http://localhost:8001"

  // Mobile detection with resize listener
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Scroll to bottom on new messages or loading state
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: isMobile ? "auto" : "smooth" })
  }, [messages, loading, isMobile])

  // Focus input on mount (only on desktop)
  useEffect(() => {
    if (!isMobile) {
      inputRef.current?.focus()
    }
  }, [isMobile])

  // WebSocket setup
  useEffect(() => {
    // Extract the domain and port from BACKEND_URL
    const backendUrl = new URL(BACKEND_URL)
    const wsProtocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${backendUrl.host}/ws`
    
    const ws = new window.WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => console.log("[WS] Conexão iniciada")
    ws.onclose = () => console.log("[WS] Conexão encerrada")
    ws.onerror = (err) => console.error("[WS] Erro:", err)
    ws.onmessage = (event) => {
      try {
        const body = JSON.parse(event.data)
        let text = typeof body.resposta === "object" && body.resposta.raw
          ? body.resposta.raw
          : String(body.resposta)

        setMessages((messages) => [
          ...messages,
          { text, from: "bot", timestamp: new Date() },
        ])
        setLoading(false)
      } catch (error) {
        console.error("[WS] Erro ao processar mensagem:", error)
        setLoading(false)
      }
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [])

  // Send user message
  const send = () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { text: input, from: "user", timestamp: new Date() }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ mensagem: userMsg.text }))
    } else {
      setMessages((m) => [
        ...m,
        { text: "Conexão com o servidor perdida. Recarregue a página.", from: "bot", timestamp: new Date() },
      ])
      setLoading(false)
    }
  }

  // Handle Enter key
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      send()
    }
  }

  // Clear only messages
  const clearChat = () => {
    setMessages([])
  }

  // Format timestamp
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <Card className="w-full max-w-xl h-full shadow-xl flex flex-col sm:rounded-lg rounded-none">
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b">
        <CardTitle className="text-xl font-bold">Chat Assistente</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          disabled={messages.length === 0}
          title="Limpar conversa"
          className="h-9 w-9"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pb-6 sm:pb-8 overflow-y-auto flex-1 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p>Envie uma mensagem para iniciar a conversa.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => {
            // regex para capturar URLs de imagens
            const imageRegex = /(https?:\/\/\S+\.(?:png|jpe?g|gif|webp))|(\.?\/?images\/\S+\.(?:png|jpe?g|gif|webp))/i
            const match = m.from === "bot" ? m.text.match(imageRegex) : null
            const imageUrl = match
              ? match[0].startsWith("http") 
                ? match[0] 
                : match[0].startsWith("./") 
                  ? `${BACKEND_URL}${match[0].replace(/^\.\//, "/")}` 
                  : match[0].startsWith("/") 
                    ? `${BACKEND_URL}${match[0]}` 
                    : `${BACKEND_URL}/${match[0]}`
              : null
            const textOnly = match
              ? m.text.replace(match[0], "").trim()
              : m.text

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex gap-2", m.from === "user" ? "justify-end" : "justify-start")}
              >
                {m.from === "bot" && (
                  <div className="flex items-start mt-1">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={cn(
                      "px-4 py-2 rounded-lg whitespace-pre-wrap break-words",
                      m.from === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    )}
                  >
                    {textOnly}
                  </div>

                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="imagem veículo"
                      className="mt-2 max-w-full rounded-lg shadow"
                      loading="lazy"
                    />
                  )}

                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(m.timestamp)}
                  </span>
                </div>

                {m.from === "user" && (
                  <div className="flex items-start mt-1">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}

          {loading && (
            <motion.div
              key="loading-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted px-4 py-2 rounded-lg rounded-tl-none">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={endRef} />
        </AnimatePresence>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-2 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex w-full gap-2"
        >
          <Input
            ref={inputRef}
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Digite sua mensagem..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
