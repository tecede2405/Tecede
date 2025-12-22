import "./index.scss"; 
import { useState, useEffect } from "react";

const OverView = () => {
    const [counts, setCounts] = useState({});
    const [totalListens, setTotalListens] = useState(0);


    useEffect(() => {
        const categories = ['nhactre', 'nhacphonk', 'nhacusuk', 'nhactrungquoc', 'nhacedm', 'nhackhongloi', 'nhactreremix'];

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

        // ✅ Gọi API đếm lượt nghe
        fetch(`${process.env.REACT_APP_API_URL}/api/songs/stats/total-listens`)
            .then(res => res.json())
            .then(data => setTotalListens(data.total || 0))
            .catch(() => setTotalListens(0));
    }, []);

    const totalSongs = Object.values(counts).reduce((sum, val) => sum + val, 0);
    const avgListen = totalSongs > 0 ? Math.round(totalListens / totalSongs) : 0;

    return (
        <>
            <h2 className="overview-title">Tổng quan hệ thống</h2>

            <table className="dashboard">
                <tbody>
                    <tr>
                        <th>Thông số</th>
                        <th>Nội dung hiển thị</th>
                    </tr>
                    <tr>
                        <td>Số bài hát hiện có</td>
                        <td>{totalSongs}</td>
                    </tr>
                    <tr>
                        <td>Playlist được tạo</td>
                        <td>7 playlist</td>
                    </tr>
                    <tr>
                        <td>Tổng số lượt nghe</td>
                        <td>{totalListens}</td>
                    </tr>
                    <tr>
                        <td>Trung bình lượt nghe/bài</td>
                        <td>{avgListen}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

export default OverView;
