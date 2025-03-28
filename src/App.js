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
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
            </Route>
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
