import { useState, useEffect } from "react";
import Layout from './pages/layout';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/index';
import About from './pages/About/index';
import Contact from './pages/contact/index';
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
              {/* Các route cho các trang chi tiết nhạc */}
              <Route path="music/nhac-tre" element={<NhacTre />} />
              <Route path="music/usuk" element={<NhacUSUK />} />
              <Route path="music/trung-quoc" element={<NhacTrungQuoc />} />
              <Route path="music/edm" element={<NhacEDM />} />
              <Route path="music/mood" element={<NhacTamTrang />} />
              <Route path="music/phonk" element={<NhacPhonk />} />
            </Route>
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
