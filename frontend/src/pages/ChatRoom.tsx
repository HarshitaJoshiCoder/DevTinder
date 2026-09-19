import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMessageHistory } from '../api/message';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import type { ChatMessage } from '../types';

export default function ChatRoom() {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (!matchId) return;
    getMessageHistory(matchId).then(setMessages);
  }, [matchId]);

  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit('join_match', matchId, (ack: { ok: boolean; error?: string }) => {
      setIsJoined(ack.ok);
    });

    function onReceive(message: ChatMessage) {
      if (message.match === matchId) setMessages((prev) => [...prev, message]);
    }
    function onTyping({ isTyping }: { userId: string; isTyping: boolean }) {
      setPeerTyping(isTyping);
    }

    socket.on('receive_message', onReceive);
    socket.on('peer_typing', onTyping);
    return () => {
      socket.off('receive_message', onReceive);
      socket.off('peer_typing', onTyping);
    };
  }, [socket, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !socket || !matchId) return;

    socket.emit('send_message', { matchId, content: draft.trim() }, (ack: { ok: boolean }) => {
      if (!ack.ok) return; // message failed silently; could surface a toast here
    });
    socket.emit('typing', { matchId, isTyping: false });
    setDraft('');
  }

  function handleChange(value: string) {
    setDraft(value);
    if (socket && matchId) {
      socket.emit('typing', { matchId, isTyping: value.length > 0 });
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-3 py-4 sm:px-4 sm:py-6">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-base-700 bg-base-900 p-4">
          {messages.map((m) => {
            const mine = m.sender === user?._id;
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    mine ? 'bg-accent-cyan text-base-950' : 'bg-base-800 text-ink-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {peerTyping && <p className="font-mono text-xs text-ink-400">typing…</p>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={isJoined ? 'Type a message…' : 'Connecting…'}
            disabled={!isJoined}
            className="flex-1 rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isJoined || !draft.trim()}
            className="rounded-md bg-accent-cyan px-4 py-2 font-medium text-base-950 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
