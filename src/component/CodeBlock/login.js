import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const codeString = `
  export default function LoginForm({ onClose, onLoginSuccess }){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // mình xin phép ẩn api cá nhân đi
    const res = await fetch("api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

   if (data.message) {
    setMessage("✅ Đăng nhập thành công");
    localStorage.setItem("isLoggedIn", "true");

    setTimeout(() => {
      if (typeof onLoginSuccess === "function") 
      onLoginSuccess();
      navigate("/admin");
      onClose(); // Ẩn form sau khi loading xong
    }, 3000);
  } else {
      setMessage("❌ " + 
      (data.error || "Đăng nhập thất bại"));
      setLoading(false);
    }
  } catch (err) {
    setMessage("❌ Lỗi kết nối server!");
    setLoading(false);
  }
};  
`;

const LoginBLock = () => {
  return (
    <SyntaxHighlighter language="javascript" style={oneDark}
    className="my-code"
    >
      {codeString}
    </SyntaxHighlighter>
  );
};

export default LoginBLock;
