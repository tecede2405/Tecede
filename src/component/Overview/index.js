import "./index.scss";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Film, Music4, Headphones, BarChart3, UsersRound, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useDonates } from "../../context/DonateContext"; // Đường dẫn đến file DonateContext của bạn

const COLORS = ["#7c3aed", "#2563eb", "#16a34a", "#ca8a04", "#db2672", "#0891b2", "#ea580c", "#ec4899", "#f97316"];

const CATEGORY_NAMES = {
  nhactre: "Nhạc Trẻ",
  nhacphonk: "Nhạc Phonk",
  nhacusuk: "Nhạc Âu Mỹ",
  nhactrungquoc: "Nhạc Hoa",
  nhacedm: "Nhạc EDM",
  nhacdouyin: "Nhạc Douyin",
  nhackhongloi: "Không Lời",
  nhactreremix: "Remix",
  nhaclofi: "Lofi"
};

const OverView = () => {
  // Lấy dữ liệu từ Donate Context
  const { donates } = useDonates();

  const [totalSongs, setTotalSongs] = useState(0);
  const [totalListens, setTotalListens] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [user, setUser] = useState(null); 

  // States quản lý thống kê quyên góp
  const [monthlyDonateData, setMonthlyDonateData] = useState([]);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const donateGoal = 500000; // Mục tiêu tháng: 500,000 VND

  const location = useLocation();

  /* ========================================================= */
  /* LOGIC XỬ LÝ DỮ LIỆU DONATE THEO THÁNG HIỆN TẠI */
  /* ========================================================= */
  useEffect(() => {
    if (!donates || donates.length === 0) return;

    // Lấy mốc thời gian hiện tại hệ thống (Năm 2026)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    // 1. Lọc tất cả các lượt donate thuộc tháng và năm hiện tại
    const currentMonthDonates = donates.filter((item) => {
      const donateDate = new Date(item.created_at.replace(" ", "T"));
      return donateDate.getFullYear() === currentYear && donateDate.getMonth() === currentMonth;
    });

    // 2. Tính tổng tiền donate trong tháng hiện tại
    const totalMonthAmount = currentMonthDonates.reduce((sum, item) => sum + (item.amount || 0), 0);
    setCurrentMonthTotal(totalMonthAmount);

    // 3. Gom nhóm số tiền quyên góp theo từng ngày trong tháng để vẽ biểu đồ mượt mà
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Số ngày của tháng hiện tại
    const dailyMap = {};
    
    // Khởi tạo mốc 0đ cho tất cả các ngày trong tháng để biểu đồ không bị đứt đoạn
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = 0;
    }

    // Cộng dồn tiền vào các ngày có giao dịch thực tế
    currentMonthDonates.forEach((item) => {
      const donateDate = new Date(item.created_at.replace(" ", "T"));
      const day = donateDate.getDate();
      dailyMap[day] += item.amount || 0;
    });

    // Chuyển đổi sang mảng cấu trúc cung cấp cho Recharts
    const chartDataFormatted = Object.keys(dailyMap).map((day) => ({
      date: `Ngày ${day}`,
      amount: dailyMap[day],
    }));

    setMonthlyDonateData(chartDataFormatted);
  }, [donates]);

  /* ===== FETCH SONGS & USERS TỔNG QUAN ===== */
  useEffect(() => {
    setUser(null);

    fetch(`${process.env.REACT_APP_API_URL}/api/songs`)
      .then((res) => res.json())
      .then((songs) => {
        if (Array.isArray(songs)) {
          setTotalSongs(songs.length);
          setTotalListens(songs.reduce((sum, song) => sum + (song.listens || 0), 0));

          const groupByCategory = songs.reduce((acc, song) => {
            const cat = song.category || "unknown";
            acc[cat] = (acc[cat] || 0) + (song.listens || 0);
            return acc;
          }, {});

          const targetCategories = [
            "nhactre", "nhacusuk", "nhactrungquoc", "nhacedm", "nhacphonk", "nhacdouyin", "nhackhongloi", "nhactreremix", "nhaclofi"
          ];

          const formattedPieData = targetCategories.map((cat) => ({
            name: CATEGORY_NAMES[cat] || cat,
            value: groupByCategory[cat] || 0
          })).filter(item => item.value > 0);

          setCategoryData(formattedPieData);
        }
      })
      .catch((err) => console.error("Lỗi fetch songs:", err));

    fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/users`)
      .then((res) => res.json())
      .then((data) => {
        let users = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [];
        setUser(users.length > 0 ? users[0].id : 0);
      })
      .catch((err) => {
        console.error("Fetch users error:", err);
        setUser(0);
      });
  }, [location.pathname]);

  const avgListen = totalSongs > 0 ? Math.round(totalListens / totalSongs) : 0;
  const totalCategoryListens = categoryData.reduce((sum, item) => sum + item.value, 0);

  // Tính toán phần trăm tiến độ đạt mục tiêu donate
  const donatePercentage = Math.min(((currentMonthTotal / donateGoal) * 100), 100).toFixed(1);

  const stats = [
    { title: "Số bài hát", value: totalSongs, icon: <Film />, color: "purple" },
    { title: "Playlist", value: 9, icon: <Music4 />, color: "blue" },
    { title: "Tổng lượt nghe", value: totalListens, icon: <Headphones />, color: "green" },
    { title: "Trung bình lượt / bài", value: avgListen, icon: <BarChart3 />, color: "yellow" },
    { title: "Người dùng đã đăng ký", value: user === null ? "..." : user, icon: <UsersRound />, color: "pink" },
  ];

  return (
    <div className="overview-page">
      {/* Grid thẻ thống kê tổng quan */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className={`stat-card ${item.color}`} key={index}>
            <div className="card-top">
              <div className="stat-icon-wrapper">{item.icon}</div>
              <p className="stat-title">{item.title}</p>
            </div>
            <div className="card-middle">
              <p className="stat-value">
                {typeof item.value === "number" ? item.value.toLocaleString("vi-VN") : item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* KHU VỰC BIỂU ĐỒ CHÍNH */}
      <div className="charts-wrapper">
        
        {/* CHART THỐNG KÊ DONATE TRONG THÁNG */}
        <div className="chart-card donate-chart-card">
          <div className="chart-header-donate">
            <div className="header-left">
              <h3>Thống kê quỹ quyên góp</h3>
              <p className="sub-title">Tháng {new Date().getMonth() + 1} / {new Date().getFullYear()}</p>
            </div>
            <div className="header-right-total">
              <DollarSign size={18} className="money-icon" />
              <span>{currentMonthTotal.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* THANH TIẾN ĐỘ DONATE TIỀN WEBSITE */}
          <div className="donate-progress-container">
            <div className="progress-text-info">
              <span>Tiến độ duy trì server: <strong>{donatePercentage}%</strong></span>
              <span>{currentMonthTotal.toLocaleString("vi-VN")}đ / {donateGoal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${donatePercentage}%` }}></div>
            </div>
          </div>

          {/* Đồ thị diện tích của Recharts */}
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyDonateData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a354f" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(value) => value >= 1000 ? `${value / 1000}K` : value} />
                <Tooltip formatter={(value) => [`${value.toLocaleString("vi-VN")}đ`, "Ủng hộ"]} contentStyle={{ background: "#111827", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fill="url(#colorDonate)" strokeWidth={2} dot={{ r: 3, stroke: "#10b981", fill: "#1f2937", strokeWidth: 2 }} />
                <defs>
                  <linearGradient id="colorDonate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ TRÒN CATEGORY LƯỢT NGHE */}
        <div className="chart-card category-chart">
          <div className="chart-header">
            <h3>Lượt nghe theo danh mục</h3>
          </div>
          <div className="chart-content pie-container">
            <div className="pie-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} fill="#8884d8" paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="pie-label-center">
                    <tspan x="50%" dy="-6" className="pie-value">
                      {totalCategoryListens >= 1000 ? `${(totalCategoryListens / 1000).toFixed(1)}K` : totalCategoryListens}
                    </tspan>
                    <tspan x="50%" dy="20" className="pie-title">Lượt nghe</tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              {categoryData.map((entry, index) => {
                const percentage = totalCategoryListens > 0 ? ((entry.value / totalCategoryListens) * 100).toFixed(1) : 0;
                return (
                  <div className="legend-item" key={index}>
                    <div className="legend-header">
                      <div className="legend-marker" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="legend-name">{entry.name}</span>
                    </div>
                    <span className="legend-value">{entry.value.toLocaleString("vi-VN")} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverView;