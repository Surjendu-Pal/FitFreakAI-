import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCommentDots, FaPaperPlane, FaRobot, FaTimes, FaTrashAlt } from "react-icons/fa";
import { clearChat, getChat, sendChat } from "../api/chatApi";
import { useAuth } from "../context/useAuth";
import "./Chatbot.css";

const DEFAULT_SUGGESTIONS = [
  "How do I get started?",
  "What should I do today?",
  "How do I track my progress?",
];
const MAX_MESSAGE_LENGTH = 2000;

function requestError(error, fallback) {
  if (error.response?.status === 401) {
    return "Your session has expired. Sign in again to access your saved chat.";
  }
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

function ChatSession({ token }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState("guide");
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [loadingHistory, setLoadingHistory] = useState(Boolean(token));
  const [historyError, setHistoryError] = useState("");
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [error, setError] = useState("");
  const [pendingText, setPendingText] = useState("");
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const scrollRef = useRef(null);
  const requestsRef = useRef(new Set());
  const busyRef = useRef(false);
  const signedIn = Boolean(token);
  const busy = Boolean(pendingText) || clearing || loadingHistory;

  // This component is keyed by the authenticated session. Aborting and
  // discarding its state prevents responses from appearing in another account.
  useEffect(() => {
    const requests = requestsRef.current;
    return () => requests.forEach((controller) => controller.abort());
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoadingHistory(true);
    setHistoryError("");
    getChat(token, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setMessages(data.messages || []);
        setMode(data.mode === "ai" ? "ai" : "guide");
        setSuggestions(data.suggestions?.length ? data.suggestions : DEFAULT_SUGGESTIONS);
        setNeedsLogin(false);
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setHistoryError(requestError(cause, "Could not load your saved chat. Check your connection and try again."));
        setNeedsLogin(cause.response?.status === 401);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingHistory(false);
      });
    return () => controller.abort();
  }, [token, historyAttempt]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, pendingText, error]);

  function closeChat() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  async function submitMessage(text = draft) {
    const message = text.trim();
    if (!message || message.length > MAX_MESSAGE_LENGTH || busyRef.current || loadingHistory || historyError) return;
    busyRef.current = true;
    const controller = new AbortController();
    requestsRef.current.add(controller);
    setDraft(message);
    setPendingText(message);
    setError("");
    setConfirmClear(false);
    try {
      const data = await sendChat(message, token, controller.signal, messages);
      if (controller.signal.aborted) return;
      setMessages((previous) => [...previous, ...data.messages]);
      setMode(data.mode === "ai" ? "ai" : "guide");
      setSuggestions(data.suggestions?.length ? data.suggestions : DEFAULT_SUGGESTIONS);
      setDraft("");
      setNeedsLogin(false);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(requestError(cause, "Could not send your message. Your text is still below; please try again."));
      setNeedsLogin(cause.response?.status === 401);
    } finally {
      requestsRef.current.delete(controller);
      if (!controller.signal.aborted) {
        busyRef.current = false;
        setPendingText("");
        inputRef.current?.focus();
      }
    }
  }

  async function resetChat() {
    if (busyRef.current) return;
    busyRef.current = true;
    const controller = new AbortController();
    requestsRef.current.add(controller);
    setClearing(true);
    setError("");
    try {
      if (token) await clearChat(token, controller.signal);
      if (controller.signal.aborted) return;
      setMessages([]);
      setSuggestions(DEFAULT_SUGGESTIONS);
      setConfirmClear(false);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(requestError(cause, "Could not clear your chat. Your conversation is still here."));
      setNeedsLogin(cause.response?.status === 401);
    } finally {
      requestsRef.current.delete(controller);
      if (!controller.signal.aborted) {
        busyRef.current = false;
        setClearing(false);
        inputRef.current?.focus();
      }
    }
  }

  return (
    <div className="fit-chat">
      {open && (
        <section
          id="fit-chat-panel"
          className="fit-chat-panel"
          role="dialog"
          aria-label="FitFreak assistant"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              closeChat();
            }
          }}
        >
          <header className="fit-chat-header">
            <span className="fit-chat-avatar" aria-hidden="true"><FaRobot /></span>
            <div className="fit-chat-heading">
              <h2>FitFreak assistant</h2>
              <span className="fit-chat-mode">{mode === "ai" ? "AI assistant" : "Built-in app guide"}</span>
            </div>
            <button
              type="button"
              className="fit-chat-icon-button"
              aria-label="Clear chat history"
              title="Clear chat history"
              disabled={!messages.length || busy || Boolean(historyError)}
              onClick={() => setConfirmClear((value) => !value)}
            ><FaTrashAlt aria-hidden="true" /></button>
            <button type="button" className="fit-chat-icon-button" aria-label="Close assistant" onClick={closeChat}>
              <FaTimes aria-hidden="true" />
            </button>
          </header>

          <p className="fit-chat-privacy">
            {signedIn ? "Chat saved to your account." : "Guest chat · Sign in to save your conversation."}
          </p>
          {confirmClear && (
            <div className="fit-chat-confirm">
              <p>Clear this conversation{signedIn ? " from your account" : ""}?</p>
              <button type="button" disabled={clearing} onClick={resetChat}>{clearing ? "Clearing…" : "Clear chat"}</button>
              <button type="button" disabled={clearing} onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          )}

          <nav className="fit-chat-shortcuts" aria-label="Fitness shortcuts">
            {signedIn ? (
              <>
                <Link to="/goals" onClick={closeChat}>My goals <FaArrowRight aria-hidden="true" /></Link>
                <Link to="/plans" onClick={closeChat}>My plans <FaArrowRight aria-hidden="true" /></Link>
                <Link to="/progress" onClick={closeChat}>Progress <FaArrowRight aria-hidden="true" /></Link>
              </>
            ) : (
              <>
                <Link to="/register" onClick={closeChat}>Create an account <FaArrowRight aria-hidden="true" /></Link>
                <Link to="/login" onClick={closeChat}>Sign in <FaArrowRight aria-hidden="true" /></Link>
              </>
            )}
          </nav>

          <div className="fit-chat-scroll" ref={scrollRef}>
            <div className="fit-chat-welcome">
              <span className="fit-chat-eyebrow">A LITTLE CLARITY, EVERY DAY</span>
              <h3>What’s your next step?</h3>
              <p>Ask how to set a goal, follow your plan, or understand your progress.</p>
            </div>
            {loadingHistory && <p className="fit-chat-status" role="status">Loading your conversation…</p>}
            {historyError && (
              <div className="fit-chat-error" role="alert">
                <p>{historyError}</p>
                <button type="button" onClick={() => setHistoryAttempt((value) => value + 1)}>Retry loading</button>
              </div>
            )}
            <div className="fit-chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
              {messages.map((message, index) => (
                <div className={`fit-chat-message fit-chat-message-${message.role === "user" ? "user" : "assistant"}`} key={message._id || `${message.role}-${index}`}>
                  <span className="fit-chat-speaker">{message.role === "user" ? "You" : "FitFreak"}</span>
                  <p>{message.content}</p>
                </div>
              ))}
              {pendingText && (
                <>
                  <div className="fit-chat-message fit-chat-message-user">
                    <span className="fit-chat-speaker">You · sending</span>
                    <p>{pendingText}</p>
                  </div>
                  <div className="fit-chat-thinking" role="status"><span aria-hidden="true" /> Preparing your answer…</div>
                </>
              )}
            </div>
            {!loadingHistory && !historyError && !pendingText && (
              <div className="fit-chat-suggestions" aria-label="Suggested questions">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button key={suggestion} type="button" disabled={busy} onClick={() => submitMessage(suggestion)}>{suggestion}</button>
                ))}
              </div>
            )}
          </div>

          {error && <div className="fit-chat-error" role="alert"><p>{error}</p></div>}
          {needsLogin && <Link className="fit-chat-signin" to="/login" onClick={closeChat}>Sign in again <FaArrowRight aria-hidden="true" /></Link>}
          <form className="fit-chat-form" onSubmit={(event) => { event.preventDefault(); submitMessage(); }}>
            <label className="fit-chat-sr-only" htmlFor="fit-chat-input">Your question</label>
            <div className="fit-chat-compose">
              <textarea
                ref={inputRef}
                id="fit-chat-input"
                rows={2}
                value={draft}
                readOnly={Boolean(pendingText)}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Ask me what to do next…"
                aria-describedby="fit-chat-input-hint"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    submitMessage();
                  }
                }}
              />
              <button type="submit" className="fit-chat-send" aria-label="Send message" disabled={busy || Boolean(historyError) || !draft.trim()}>
                <FaPaperPlane aria-hidden="true" />
              </button>
            </div>
            <div className="fit-chat-input-hint" id="fit-chat-input-hint"><span>Enter to send · Shift + Enter for a new line</span><span>{draft.length}/{MAX_MESSAGE_LENGTH}</span></div>
            <p className="fit-chat-footnote">{mode === "ai" ? "Uses your goals and plans to answer. AI can make mistakes." : "Built-in guidance for using FitFreak, available without AI."}</p>
          </form>
        </section>
      )}
      <button
        ref={launcherRef}
        type="button"
        className={`fit-chat-launcher${open ? " is-open" : ""}`}
        aria-label={open ? "Close FitFreak assistant" : "Ask FitFreak assistant"}
        aria-expanded={open}
        aria-controls={open ? "fit-chat-panel" : undefined}
        onClick={() => { if (open) closeChat(); else setOpen(true); }}
      >
        {open ? <FaTimes aria-hidden="true" /> : <FaCommentDots aria-hidden="true" />}
        <span>{open ? "Close chat" : "Ask FitFreak"}</span>
      </button>
    </div>
  );
}

export default function Chatbot() {
  const { user, token } = useAuth();
  const sessionToken = user && token ? token : null;
  return <ChatSession key={sessionToken || "guest"} token={sessionToken} />;
}
