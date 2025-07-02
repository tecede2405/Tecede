import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const codeString = `
function AddSongs() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("nhactre");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("❌ Bạn chưa chọn file mp3!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("image", image);
    formData.append("category", category);
    formData.append("file", file);

    try {
    // api của tui nên xin phép không công khai
      const res = await fetch("api", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Thêm bài hát thành công!");
        setTitle("");
        setArtist("");
        setImage("");
        setFile(null);
        setCategory("nhactre");

        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + (data.error
       || "Thêm bài hát thất bại"));
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server!");
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
