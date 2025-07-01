import "./index.scss"; 
import {useState, useEffect} from "react";
const OverView = () => {

    const [counts, setCounts] = useState({});

    useEffect(() => {
    const categories = ['nhactre', 'nhacphonk', 'nhacusuk', 'nhactrungquoc'];

    Promise.all(
        categories.map(cat =>
        fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/${cat}`)
            .then(res => res.json())
            .then(data => ({ [cat]: data.length }))
        )
    ).then(results => {
        const merged = Object.assign({}, ...results);
        setCounts(merged);
    });
    }, []);
    const totalSongs = Object.values(counts).reduce((sum, val) => sum + val, 0);
   

    return(
        <>
            <h2 className="overview-title">📊 Tổng quan hệ thống</h2>

            <table className="dashboard">
                <tr>
                <th>Thông số</th>
                <th>Nội dung hiển thị</th>
                </tr>
                <tr>
                <td>🎵 Số bài hát hiện có</td>
                <td>{totalSongs}</td>
                </tr>
                <tr>
                <td>👥 Tổng người dùng</td>
                <td>35</td>
                </tr>
                <tr>
                <td>💽 Playlist được tạo</td>
                <td>7 playlist</td>
                </tr>
                <tr>
                <td>🚀 Lượt phát hôm nay</td>
                <td>Chưa có dữ liệu</td>
                </tr>
                <tr>
                <td>🕒 Thời gian nghe trung bình</td>
                <td>4 phút 27 giây</td>
                </tr>
            </table>
        </>
    );
};

export default OverView;