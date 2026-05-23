import { useState, useEffect } from "react";
import Layout from "./pages/layout";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/index";
// import About from "./pages/About/index";
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
import NhacDouyin from "./pages/Music/Nhac Douyin/index";
import NhacLofi from "./pages/Music/Nhac Lofi/index";
import NotFound from "./pages/page404/index";
// Admin
import AddSongs from "./component/AddSongs/index";
import ManageSongs from "./component/ManageSongs/index";
import RequireAuth from "./component/RequireAuth/index";
import OverView from "./component/Overview/index";
import EditSong from "./pages/EditSong/index";
import ManageUsers from "./pages/ManageUsers/index";
import AddFilms from "./component/AddFilms/index";
import AddDonate from "./component/AddDonate/index";
// Other pages
import UsingApp from "./pages/using-app/index";
import UsingAppIos from "./pages/using-app/ios";
import HistoryFilm from "./pages/HistoryFilm/index";
import Anime from "./pages/Amine/index";
import AnimeDetail from "./pages/AnimeDetail/index";
import AnimeSearch from "./pages/AnimeSearch/index";
import FilmDetail from "./pages/FilmDetail/index";
import FilmInfo from "./pages/FilmDetail/filmDetail";
import FilmListBySlug from "./pages/Film/index";
import ListFilm from "./pages/ListFilm/index";
import GenrePage from "./pages/genresFilm/index";
import FilmListByCountry from "./pages/FilmByCountry/index";
import Manga from "./pages/Manga/index";
import MangaDetail from "./pages/Manga/mangaDetail";
import MangaSearch from "./pages/Manga/mangaSearch";
import MangaReader from "./pages/Manga/mangaReader";
import LoginPage from "./pages/Login/index";
import RegisterPage from "./pages/Register/index";
import ProfilePage from "./pages/ProfilePage/index";
import Donates from "./pages/Donate/index";
import Support from "./pages/Support/index";
import TemporaryClosed404 from "./pages/Error/index";
// UI
import Squares from "./component/SquaresBackgound/index";

// Utils
import socket from "./utils/socket";
import { getVisitorId } from "./utils/visitor";
import { subscribeUser } from "./utils/pushNotification";



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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/donates" element={<Donates />} />
                  <Route path="/ung-ho" element={<Support />} />
                  {/* <Route path="about" element={<About />} /> */}
                  <Route path="using-app" element={<UsingApp />} />
                  <Route path="using-app-ios" element={<UsingAppIos />} />
                  {/* Film */}
                  <Route path="xem-phim/:slug/:server/:episodeSlug" element={<FilmDetail />} />
                  <Route path="search/:filmSlug" element={<FilmListBySlug />} />
                  <Route path="/chi-tiet/:slug" element={<FilmInfo />} />
                  <Route path="/detail/:type" element={<ListFilm />} />
                  <Route path="/the-loai/:slug" element={<GenrePage />} />
                  <Route path="/quoc-gia/:slug" element={<FilmListByCountry />} />
                  {/* Manga */}
                  <Route path="truyen" element={<Manga />} />
                  <Route path="truyen/chi-tiet/:slug" element={<MangaDetail />} />
                  <Route path="/truyen/tim-kiem/:slug" element={<MangaSearch />} />
                  <Route path="/truyen/doc/:id" element={<MangaReader />} />

                  <Route path="/history" element={<HistoryFilm />} />
                  {/* Music */}
                  <Route path="music/nhac-tre" element={<NhacTre />} />
                  <Route path="music/usuk" element={<NhacUSUK />} />
                  <Route path="music/trung-quoc" element={<NhacTrungQuoc />} />
                  <Route path="music/edm" element={<NhacEDM />} />
                  <Route path="music/mood" element={<NhacTamTrang />} />
                  <Route path="music/phonk" element={<NhacPhonk />} />
                  <Route path="music/nhac-lofi" element={<NhacLofi />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/404closed" element={<TemporaryClosed404 />} />
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
                    {/* Trang mặc định /admin */}
                    <Route index element={<OverView />} />

                    {/* Nested routes */}
                    <Route path="add-song" element={<AddSongs />} />

                    <Route path="add-film" element={<AddFilms />} />

                    <Route path="manage" element={<ManageSongs />} />


                    {/* USERS */}
                    <Route path="users" element={<ManageUsers />} />

                    <Route path="donate" element={<AddDonate />} />
                    <Route
                      path="songs/edit/:id"
                      element={<EditSong />}
                    />
                  </Route>

               
                  <Route path="*" element={<NotFound />} />
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
