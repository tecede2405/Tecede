import React, { useState, useEffect, useRef } from "react";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved
      ? JSON.parse(saved)
      : [{ role: "system", content: "Xin chào! Tôi có thể giúp gì cho bạn?" }];
  });
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);


  const messagesEndRef = useRef(null); // ✅ dùng để scroll

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const updated = [...messages, { role: "user", content: userInput }];
    setMessages(updated);
    setUserInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: updated })
      });

      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        setMessages([...updated, data.choices[0].message]);
      } else {
        const errorMsg = data.error?.message || "Không thể phản hồi lúc này.";
        setMessages([
          ...updated,
          { role: "assistant", content: `❌ Lỗi: ${errorMsg}` }
        ]);
      }

    } catch (err) {
      console.error("Lỗi khi gọi backend:", err);
      setMessages([
        ...updated,
        { role: "assistant", content: "❌ Lỗi kết nối đến máy chủ." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chat-toggle-button" onClick={toggleChat}>
        💬
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-box-header">
            Trợ lý hỗ trợ{" "}
            <span style={{ fontWeight: "normal", fontSize: 13 }}></span>
            <button
              onClick={toggleChat}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 16,
                marginLeft: "auto"
              }}
            >
              ✕
            </button>
          </div>

          <div className="chat-box-messages">
            {messages.slice(1).map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${
                  msg.role === "user" ? "user" : "bot"
                }`}
              >
                <b>{msg.role === "user" ? "Bạn" : "Bot"}:</b> {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">Bot đang trả lời...</div>
            )}
            <div ref={messagesEndRef} /> {/* ✅ Phần tử scroll tới cuối */}
          </div>

          <div className="chat-box-input">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập nội dung..."
              disabled={loading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
