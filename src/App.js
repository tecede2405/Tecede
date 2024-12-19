import Layout from './pages/layout';
import './App.css';
import { Route,Routes} from 'react-router-dom';
import Home from './pages/Home/index';
import About from './pages/About/index';
import Contact from './pages/contact/index';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />}/>
        <Route path="about" element={<About/>}/>
        <Route path="contact" element={<Contact/>}/>
      </Route>
    </Routes>
    </>
    
  );
}

export default App;
