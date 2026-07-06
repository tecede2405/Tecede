import { useState, useEffect } from "react";
import Layout from "./pages/layout";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/index";
// import About from "./pages/About/index";
import Admin from "./pages/Admin/index";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Loading from "./component/LoadingScreen/index";
import ScrollToTop from "./component/ScrollToTop/index";

// Music pages
import MusicCategory  from "./pages/Music/MusicCategory/index";
// Admin
import AddSongs from "./component/AddSongs/index";
import ManageSongs from "./component/ManageSongs/index";
import RequireAuth from "./component/RequireAuth/index";
import OverView from "./component/Overview/index";
import EditSong from "./pages/EditSong/index";
import ManageUsers from "./pages/ManageUsers/index";
import AddFilms from "./component/AddFilms/index";
import AddDonate from "./component/AddDonate/index";
import MovieManager from "./pages/MovieManager/index";
import UploadFile from "./pages/Storage/upload/index";
import Gallery from "./pages/Storage/gallery/index";
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
import FilterFilm from "./pages/FilterFilm/index";
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
import NotFound from "./pages/page404/index";
// UI
// import Squares from "./component/SquaresBackgound/index";

// Utils
import { subscribeUser } from "./utils/pushNotification";



function App() {
  const [loading, setLoading] = useState(true);

  /* ================= LOADING + PUSH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      subscribeUser();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


;



  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="app-wrapper">
            {/* Background */}
            {/* <Squares
              speed={0.5}
              squareSize={40}
              direction="diagonal"
              borderColor="#444"
              hoverFillColor="#222"
              className="bg-layer"
            /> */}

            {/* Main content */}
            <div className="app-content">
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
                  <Route path="/loc-phim" element={<FilterFilm />} />
                  {/* Manga */}
                  <Route path="truyen" element={<Manga />} />
                  <Route path="truyen/chi-tiet/:slug" element={<MangaDetail />} />
                  <Route path="/truyen/tim-kiem/:slug" element={<MangaSearch />} />
                  <Route path="/truyen/doc/:id" element={<MangaReader />} />

                  <Route path="/history" element={<HistoryFilm />} />
                  {/* Music */}
                  <Route path="music/:categorySlug" element={<MusicCategory />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/404closed" element={<TemporaryClosed404 />} />

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

                    <Route path="manage-movie" element={<MovieManager />} />

                    <Route path="upload-file" element={<UploadFile />} />

                    <Route path="gallery" element={<Gallery />} />
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
