import { useState, useEffect } from "react";
import Layout from "./pages/layout";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/index";
import About from "./pages/About/index";
import Admin from "./pages/Admin/index";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Loading from "./component/Loading/index";
import ScrollToTop from "./component/ScrollToTop/index";

// Music pages
import NhacTre from "./pages/Music/NhacTre/index";
import NhacUSUK from "./pages/Music/Nhac usuk/index";
import NhacTrungQuoc from "./pages/Music/NhacTrung/index";
import NhacEDM from "./pages/Music/Nhac Edm/index";
import NhacTamTrang from "./pages/Music/NhacTamTrang/index";
import NhacPhonk from "./pages/Music/Nhac Phonk/index";
import NhacTreRemix from "./pages/Music/NhacTreRemix/index";
import NhacDouyin from "./pages/Music/Nhac Douyin";

// Admin
import AddSongs from "./component/AddSongs/index";
import ManageSongs from "./component/ManageSongs/index";
import RequireAuth from "./component/RequireAuth/index";
import AdminFeature from "./pages/admin-feature/index";
import EditSong from "./pages/EditSong/index";

// Other pages
import UsingApp from "./pages/using-app/index";
import Anime from "./pages/Amine/index";
import AnimeDetail from "./pages/AnimeDetail/index";
import AnimeSearch from "./pages/AnimeSearch/index";
import FilmDetail from "./pages/FilmDetail/index";
import FilmListBySlug from "./pages/Film/index";
import ListFilm from "./pages/ListFilm/index";
import GenrePage from "./pages/genresFilm/index";

// UI
import Squares from "./component/SquaresBackgound/index";

// Utils
import socket from "./utils/socket";
import { getVisitorId } from "./utils/visitor";
import { subscribeUser } from "./utils/pushNotification";
import { trackVisit } from "./utils/trackVisitor";
import VisitLogs from "./pages/Admin/VisitLogs";


function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  /* ================= LOADING + PUSH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      subscribeUser();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  /* ================= TRACK VISIT ================= */
 useEffect(() => {
  // Ghi log ngay khi load trang
  trackVisit(location.pathname);

  // Ghi log định kỳ mỗi 30 giây
  const interval = setInterval(() => {
    trackVisit(location.pathname);
  }, 30000);

  return () => clearInterval(interval);
}, [location.pathname]);

  /* ================= SOCKET ONLINE TRACK ================= */
  useEffect(() => {
    const visitorId = getVisitorId();

    socket.emit("user:online", {
      visitorId,
      page: location.pathname,
    });
  }, [location.pathname]);



  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            {/* Background */}
            <Squares
              speed={0.5}
              squareSize={40}
              direction="diagonal"
              borderColor="#444"
              hoverFillColor="#222"
              className="bg-layer"
            />

            {/* Main content */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <ScrollToTop />

              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="using-app" element={<UsingApp />} />

                  {/* Film */}
                  <Route path="film/:slug" element={<FilmDetail />} />
                  <Route path="search/:filmSlug" element={<FilmListBySlug />} />
                  <Route path="/detail/:type" element={<ListFilm />} />
                  <Route path="/the-loai/:slug" element={<GenrePage />} />
                  {/* Music */}
                  <Route path="music/nhac-tre" element={<NhacTre />} />
                  <Route path="music/usuk" element={<NhacUSUK />} />
                  <Route path="music/trung-quoc" element={<NhacTrungQuoc />} />
                  <Route path="music/edm" element={<NhacEDM />} />
                  <Route path="music/mood" element={<NhacTamTrang />} />
                  <Route path="music/phonk" element={<NhacPhonk />} />
                  <Route
                    path="music/nhactre-remix"
                    element={<NhacTreRemix />}
                  />
                  <Route path="music/nhac-douyin" element={<NhacDouyin />} />

                  {/* Anime */}
                  <Route path="anime" element={<Anime />} />
                  <Route path="anime/:id" element={<AnimeDetail />} />
                  <Route path="search" element={<AnimeSearch />} />

                  {/* Admin */}
                  <Route
                    path="admin"
                    element={
                      <RequireAuth>
                        <Admin />
                      </RequireAuth>
                    }
                  >
                    <Route path="add" element={<AddSongs />} />
                    <Route path="manage" element={<ManageSongs />} />
                  </Route>
                  <Route path="/admin/visits" element={<VisitLogs />} />
                  <Route
                    path="/admin/songs/edit/:id"
                    element={<EditSong />}
                  />

                  <Route path="/admin-post" element={<AdminFeature />} />
                </Route>
              </Routes>
            </div>
          </div>
        </>
      )}

      <Analytics />
    </>
  );
}

export default App;
