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
          {/* <CustomCursor /> */}
          <ScrollToTop />
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="/admin-post" element={<AdminFeature />} />
              <Route path="admin"
              element={
                <RequireAuth>
                  <Admin />
                </RequireAuth>
              }>
                <Route path="add" element={<AddSongs />} />
                <Route path="manage" element={<ManageSongs />} />
              </Route>
              {/* Các route cho các trang chi tiết nhạc */}
              <Route path="music/nhac-tre" element={<NhacTre />} />
              <Route path="music/usuk" element={<NhacUSUK />} />
              <Route path="music/trung-quoc" element={<NhacTrungQuoc />} />
              <Route path="music/edm" element={<NhacEDM />} />
              <Route path="music/mood" element={<NhacTamTrang />} />
              <Route path="music/phonk" element={<NhacPhonk />} />
              <Route path="music/nhactre-remix" element={<NhacTreRemix />} />
            </Route>
          </Routes>
        </>
      )}
      <Analytics />
      <ChatWidget />
    </>
  );
}

export default App;
