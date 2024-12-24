import { FaFacebook, FaTiktok, FaYoutube, FaInstagram} from 'react-icons/fa';

function Tabbar(){
    return(
        <>
        <div className="tabbar">
                <p>Our channels</p>
                <ul>
                    <li><a href="https://www.facebook.com/thoaidz.vx" target="_blank"><FaFacebook class="icon"/>FaceBook</a></li>
                    <li><a href="https://www.youtube.com/@Tecede2405" target="_blank"><FaYoutube class="icon"/> Youtube</a></li>
                    <li><a href="https://www.tiktok.com/@p.qthoai2405_" target="_blank"><FaTiktok class="icon"/> Tiktok</a></li>
                    <li><a href="https://www.instagram.com/p.qthoai2405_/" target="_blank"><FaInstagram class="icon"/> Instagram</a></li>
                    
                </ul>
            </div>
        </>
    )
}

export default Tabbar;