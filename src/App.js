import { useState, useEffect } from "react";
import Layout from './pages/layout';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/index';
import About from './pages/About/index';
import Contact from './pages/contact/index';
import Admin from './pages/Admin/index';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import CustomCursor from "./component/HoverEffect/index";
import Loading from "./component/Loading/index";
import ScrollToTop from "./component/ScrollToTop/index";
// Các file nhạc (detail pages)
import NhacTre from './pages/Music/NhacTre/index';
import NhacUSUK from './pages/Music/Nhac usuk/index';
import NhacTrungQuoc from './pages/Music/NhacTrung/index';
import NhacEDM from './pages/Music/Nhac Edm/index';
import NhacTamTrang from './pages/Music/NhacTamTrang/index';
import NhacPhonk from './pages/Music/Nhac Phonk/index';
import NhacTreRemix from './pages/Music/NhacTreRemix/index';
import AddSongs from "./component/AddSongs/index";
import ManageSongs from "./component/ManageSongs/index";
import RequireAuth from "./component/RequireAuth/index";
import AdminFeature from "./pages/admin-feature/index"
import ChatWidget from "./component/ChatWidget/ChatWidget";
import UsingApp from "./pages/using-app/index";
import Anime from "./pages/Amine/index";
import AnimeDetail from"./pages/AnimeDetail/index";
import AnimeSearch from "./pages/AnimeSearch/index";
import Squares from './component/SquaresBackgound/index';
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000); // Giả lập thời gian tải trang
  }, []);


  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          {/* Background luôn dưới cùng */}
          <Squares 
            speed={0.5} 
            squareSize={40} 
            direction="diagonal"
            borderColor="#444"
            hoverFillColor="#222"
            className="bg-layer"
          />

          {/* Nội dung chính luôn nổi lên trên */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <ScrollToTop />
            <Routes>
              <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="/admin-post" element={<AdminFeature />} />
                <Route path="/using-app" element={<UsingApp />} />
                <Route path="admin"
                  element={
                    <RequireAuth>
                      <Admin />
                    </RequireAuth>
                  }>
                    <Route path="add" element={<AddSongs />} />
                    <Route path="manage" element={<ManageSongs />} />
                </Route>
                <Route path="music/nhac-tre" element={<NhacTre />} />
                <Route path="music/usuk" element={<NhacUSUK />} />
                <Route path="music/trung-quoc" element={<NhacTrungQuoc />} />
                <Route path="music/edm" element={<NhacEDM />} />
                <Route path="music/mood" element={<NhacTamTrang />} />
                <Route path="music/phonk" element={<NhacPhonk />} />
                <Route path="music/nhactre-remix" element={<NhacTreRemix />} />
                <Route path="/anime" element={<Anime />} />
                <Route path="/anime/:id" element={<AnimeDetail />} />
                <Route path="/search" element={<AnimeSearch />} />
              </Route>
            </Routes>
          </div>
        </div>
        </>
      )}
      <Analytics />
      <ChatWidget />
    </>
  );
}

export default App;
