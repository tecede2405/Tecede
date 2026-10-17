import { jdFromDate, jdToDate, convertSolar2Lunar } from "./lunarCalendar";

// Cấu hình các Theme không gian tương ứng với từng dịp lễ
export const THEMES = {
  pink: {
    id: "pink",
    name: "Hồng Tri Ân & Lãng Mạn",
    shortName: "Hồng 20/10 & 8/3",
    description: "Cánh hoa hồng xoay 3D lãng mạn và trái tim phát sáng mờ ảo",
    badge: "20/10 • 8/3 • Valentine",
    primaryColor: "#f43f5e",
    secondaryColor: "#ec4899",
    accentColor: "#fda4af",
    textColor: "#ffe4e6",
    bgGradient: "linear-gradient(135deg, #160812 0%, #290f23 50%, #150711 100%)",
    headerGlow: "rgba(244, 63, 94, 0.35)",
    icon: "FaHeart"
  },
  tet: {
    id: "tet",
    name: "Tết & Đón Năm Mới",
    shortName: "Tết Pháo Hoa",
    description: "Pháo hoa đại hội rực rỡ, tàn hoa lung linh và hoa mai hoa đào bay",
    badge: "Tết Nguyên Đán • Giao Thừa",
    primaryColor: "#ef4444",
    secondaryColor: "#eab308",
    accentColor: "#fde047",
    textColor: "#fef08a",
    bgGradient: "linear-gradient(135deg, #1b0707 0%, #350c0c 50%, #180505 100%)",
    headerGlow: "rgba(239, 68, 68, 0.4)",
    icon: "FaFire"
  },
  noel: {
    id: "noel",
    name: "Giáng Sinh Tuyết Trắng",
    shortName: "Noel Băng Tuyết",
    description: "Bông tuyết 3D xoay rơi với độ sâu trường ảnh và ánh sáng Giáng Sinh",
    badge: "Noel 24-25/12",
    primaryColor: "#10b981",
    secondaryColor: "#06b6d4",
    accentColor: "#99f6e4",
    textColor: "#ccfbf1",
    bgGradient: "linear-gradient(135deg, #051617 0%, #0a2628 50%, #041214 100%)",
    headerGlow: "rgba(6, 182, 212, 0.35)",
    icon: "FaSnowflake"
  },
  national: {
    id: "national",
    name: "Hào Hùng Dân Tộc",
    shortName: "Cờ Đỏ Sao Vàng",
    description: "Chùm sao vàng bay bổng và dải ánh sáng vinh quang thiêng liêng",
    badge: "30/4 • 2/9 • Giỗ Tổ",
    primaryColor: "#dc2626",
    secondaryColor: "#facc15",
    accentColor: "#fef08a",
    textColor: "#fef9c3",
    bgGradient: "linear-gradient(135deg, #19080b 0%, #300f14 50%, #150609 100%)",
    headerGlow: "rgba(220, 38, 38, 0.4)",
    icon: "FaFlag"
  },
  midautumn: {
    id: "midautumn",
    name: "Đêm Trăng Rằm & Trung Thu",
    shortName: "Trăng Rằm Đom Đóm",
    description: "Ánh trăng rằm dạ quang, đom đóm lung linh và lồng đèn rực rỡ",
    badge: "Rằm Tháng 8 • Trung Thu",
    primaryColor: "#f59e0b",
    secondaryColor: "#818cf8",
    accentColor: "#fde68a",
    textColor: "#fef3c7",
    bgGradient: "linear-gradient(135deg, #100d20 0%, #1e1738 50%, #0d0a1b 100%)",
    headerGlow: "rgba(245, 158, 11, 0.35)",
    icon: "FaMoon"
  },
  halloween: {
    id: "halloween",
    name: "Lễ Hội Ma Quái Halloween",
    shortName: "Halloween Huyền Bí",
    description: "Đốm lửa cam ma thuật, sương mù huyền bí và bóng dơi bay lượn",
    badge: "Halloween 31/10",
    primaryColor: "#f97316",
    secondaryColor: "#a855f7",
    accentColor: "#fed7aa",
    textColor: "#ffedd5",
    bgGradient: "linear-gradient(135deg, #180922 0%, #2b1138 50%, #13071b 100%)",
    headerGlow: "rgba(249, 115, 22, 0.4)",
    icon: "FaGhost"
  },
  default: {
    id: "default",
    name: "Vũ Trụ Cinema Huyền Bí",
    shortName: "Mặc định (Vũ trụ)",
    description: "Trường sao 3D lướt nhẹ nhàng, mang lại cảm giác không gian vô tận",
    badge: "Mặc định",
    primaryColor: "#38bdf8",
    secondaryColor: "#818cf8",
    accentColor: "#bae6fd",
    textColor: "#f1f5f9",
    bgGradient: "linear-gradient(135deg, #070a12 0%, #0f1626 50%, #070a12 100%)",
    headerGlow: "rgba(56, 189, 248, 0.3)",
    icon: "FaStar"
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon 2077",
    shortName: "Neon Viễn Tưởng",
    description: "Ánh sáng Neon tím cyan tương lai, chùm laser quét ma mị và xung năng lượng số",
    badge: "Sci-Fi • Neon Glow",
    primaryColor: "#a855f7",
    secondaryColor: "#06b6d4",
    accentColor: "#f43f5e",
    textColor: "#e0e7ff",
    bgGradient: "linear-gradient(135deg, #130826 0%, #1a0b36 50%, #0c051a 100%)",
    headerGlow: "rgba(168, 85, 247, 0.45)",
    icon: "FaBolt"
  },
  ocean: {
    id: "ocean",
    name: "Đại Dương Sâu Thẳm",
    shortName: "Đại Dương Huyền Ảo",
    description: "Bọt khí biển lấp lánh nổi từ đáy vực sâu, sinh vật phát quang và hải lưu ngọc bích",
    badge: "Deep Ocean • Thư giãn",
    primaryColor: "#0284c7",
    secondaryColor: "#14b8a6",
    accentColor: "#7dd3fc",
    textColor: "#e0f2fe",
    bgGradient: "linear-gradient(135deg, #031322 0%, #06233d 50%, #020c17 100%)",
    headerGlow: "rgba(2, 132, 199, 0.4)",
    icon: "FaWater"
  },
  sakura: {
    id: "sakura",
    name: "Hoa Anh Đào Nhật Bản",
    shortName: "Mùa Hoa Sakura",
    description: "Cánh hoa anh đào phớt hồng bay nhẹ nhàng trong làn gió xuân xứ Phù Tang thanh bình",
    badge: "Sakura • Mùa Xuân",
    primaryColor: "#ec4899",
    secondaryColor: "#f472b6",
    accentColor: "#fbcfe8",
    textColor: "#fdf2f8",
    bgGradient: "linear-gradient(135deg, #1f0b18 0%, #301026 50%, #150610 100%)",
    headerGlow: "rgba(236, 72, 153, 0.4)",
    icon: "FaSpa"
  },
  aurora: {
    id: "aurora",
    name: "Bắc Cực Quang Huyền Ảo",
    shortName: "Cực Quang Aurora",
    description: "Dải lụa cực quang ma mị chuyển màu lục bảo và tím thạch anh uốn lượn giữa trời đêm",
    badge: "Aurora • Bắc Cực",
    primaryColor: "#10b981",
    secondaryColor: "#8b5cf6",
    accentColor: "#6ee7b7",
    textColor: "#ecfdf5",
    bgGradient: "linear-gradient(135deg, #051a14 0%, #0a2924 50%, #071524 100%)",
    headerGlow: "rgba(16, 185, 129, 0.4)",
    icon: "FaCompass"
  },
  sunset: {
    id: "sunset",
    name: "Rừng Thu & Hoàng Hôn",
    shortName: "Lá Phong Hoàng Hôn",
    description: "Lá phong mùa thu đỏ cam lượn bay trong ráng chiều hoàng hôn rực rỡ và ấm cúng",
    badge: "Mùa Thu • Hoàng Hôn",
    primaryColor: "#ea580c",
    secondaryColor: "#eab308",
    accentColor: "#fdba74",
    textColor: "#ffedd5",
    bgGradient: "linear-gradient(135deg, #240e06 0%, #381608 50%, #170803 100%)",
    headerGlow: "rgba(234, 88, 12, 0.4)",
    icon: "FaLeaf"
  },
  matrix: {
    id: "matrix",
    name: "Thế Giới Ma Trận Kỹ Thuật Số",
    shortName: "Mưa Code Matrix",
    description: "Cơn mưa ký tự code xanh phosphor huyền thoại rơi xuống từ không gian ma trận ảo",
    badge: "Hacker • Matrix Rain",
    primaryColor: "#22c55e",
    secondaryColor: "#15803d",
    accentColor: "#86efac",
    textColor: "#dcfce7",
    bgGradient: "linear-gradient(135deg, #031508 0%, #06240d 50%, #020c04 100%)",
    headerGlow: "rgba(34, 197, 94, 0.45)",
    icon: "FaCode"
  }
};

// Danh sách các sự kiện văn hóa, ngày lễ lớn trong năm
export const VIETNAM_EVENTS = [
  // --- THÁNG 1 ---
  {
    id: "tet-duong-lich",
    title: "Tết Dương Lịch",
    shortTitle: "Tết Tây",
    isLunar: false,
    day: 1,
    month: 1,
    theme: "tet",
    category: "Lễ lớn",
    desc: "Ngày đầu tiên của năm mới theo lịch dương, khởi đầu cho vạn điều may mắn.",
    wishes: "Chúc bạn và gia đình một năm mới An Khang Thịnh Vượng, vạn sự như ý!",
    isOfficialHoliday: true
  },
  // --- THÁNG 2 ---
  {
    id: "valentine",
    title: "Lễ Tình Nhân (Valentine)",
    shortTitle: "Valentine",
    isLunar: false,
    day: 14,
    month: 2,
    theme: "pink",
    category: "Tình yêu",
    desc: "Ngày tôn vinh tình yêu lãng mạn trên khắp thế giới.",
    wishes: "Chúc cho những ai đang yêu luôn ngọt ngào, ai chưa yêu sớm tìm thấy nửa kia đích thực!",
    isOfficialHoliday: false
  },
  {
    id: "thay-thuoc-vn",
    title: "Ngày Thầy thuốc Việt Nam",
    shortTitle: "Thầy thuốc VN",
    isLunar: false,
    day: 27,
    month: 2,
    theme: "default",
    category: "Kỷ niệm",
    desc: "Tri ân đội ngũ y bác sĩ, những người hùng thầm lặng bảo vệ sức khỏe nhân dân.",
    wishes: "Kính chúc các y bác sĩ và nhân viên y tế luôn dồi dào sức khỏe và tâm huyết với nghề cao quý!",
    isOfficialHoliday: false
  },
  // --- THÁNG 3 ---
  {
    id: "quoc-te-phu-nu",
    title: "Ngày Quốc tế Phụ nữ (8/3)",
    shortTitle: "Quốc tế Phụ nữ",
    isLunar: false,
    day: 8,
    month: 3,
    theme: "pink",
    category: "Tôn vinh",
    desc: "Ngày tôn vinh phái đẹp, người phụ nữ dịu dàng, kiên cường và yêu thương.",
    wishes: "Chúc một nửa thế giới luôn xinh đẹp rạng rỡ, hạnh phúc ngập tràn và luôn được yêu thương!",
    isOfficialHoliday: false
  },
  {
    id: "doan-thanh-nien",
    title: "Ngày Thành lập Đoàn TNCS HCM",
    shortTitle: "Thành lập Đoàn",
    isLunar: false,
    day: 26,
    month: 3,
    theme: "national",
    category: "Tuổi trẻ",
    desc: "Kỷ niệm ngày truyền thống vẻ vang của tuổi trẻ và thanh niên Việt Nam.",
    wishes: "Tuổi trẻ rực rỡ, nhiệt huyết cống hiến và không ngừng tiên phong vươn lên!",
    isOfficialHoliday: false
  },
  // --- THÁNG 4 ---
  {
    id: "giai-phong-mien-nam",
    title: "Ngày Giải phóng Miền Nam (30/4)",
    shortTitle: "Giải phóng Miền Nam",
    isLunar: false,
    day: 30,
    month: 4,
    theme: "national",
    category: "Lễ lớn",
    desc: "Đại thắng mùa xuân 1975, ngày non sông Việt Nam liền một dải, độc lập trọn vẹn.",
    wishes: "Tự hào truyền thống anh hùng dựng nước và giữ nước của dân tộc Việt Nam!",
    isOfficialHoliday: true
  },
  // --- THÁNG 5 ---
  {
    id: "quoc-te-lao-dong",
    title: "Ngày Quốc tế Lao động (1/5)",
    shortTitle: "Quốc tế Lao động",
    isLunar: false,
    day: 1,
    month: 5,
    theme: "national",
    category: "Lễ lớn",
    desc: "Tôn vinh giai cấp cần lao và tinh thần đoàn kết quốc tế của người lao động.",
    wishes: "Chúc mọi người có kỳ nghỉ lễ an lành, sạc đầy năng lượng cho công việc và cuộc sống!",
    isOfficialHoliday: true
  },
  // --- THÁNG 6 ---
  {
    id: "quoc-te-thieu-nhi",
    title: "Ngày Quốc tế Thiếu nhi (1/6)",
    shortTitle: "Quốc tế Thiếu nhi",
    isLunar: false,
    day: 1,
    month: 6,
    theme: "pink",
    category: "Gia đình",
    desc: "Ngày hội dành cho các em nhỏ, thế hệ búp trên cành tương lai của đất nước.",
    wishes: "Chúc các em bé luôn chăm ngoan, khỏe mạnh và có tuổi thơ hồn nhiên, hạnh phúc!",
    isOfficialHoliday: false
  },
  {
    id: "gia-dinh-vn",
    title: "Ngày Gia đình Việt Nam",
    shortTitle: "Gia đình VN",
    isLunar: false,
    day: 28,
    month: 6,
    theme: "pink",
    category: "Gia đình",
    desc: "Tôn vinh giá trị mái ấm gia đình, bến đỗ bình yên của mỗi con người.",
    wishes: "Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc!",
    isOfficialHoliday: false
  },
  // --- THÁNG 7 ---
  {
    id: "thuong-binh-liet-si",
    title: "Ngày Thương binh - Liệt sĩ (27/7)",
    shortTitle: "Thương binh Liệt sĩ",
    isLunar: false,
    day: 27,
    month: 7,
    theme: "national",
    category: "Tri ân",
    desc: "Đời đời nhớ ơn các anh hùng liệt sĩ, thương binh đã hy sinh vì nền độc lập tự do.",
    wishes: "Uống nước nhớ nguồn, ngàn đời khắc ghi công ơn thế hệ cha anh!",
    isOfficialHoliday: false
  },
  // --- THÁNG 8 ---
  {
    id: "cach-mang-thang-tam",
    title: "Ngày Cách mạng Tháng Tám",
    shortTitle: "Cách mạng T8",
    isLunar: false,
    day: 19,
    month: 8,
    theme: "national",
    category: "Lịch sử",
    desc: "Kỷ niệm ngày Cách mạng Tháng Tám thành công năm 1945.",
    wishes: "Khí thế quật khởi ngàn năm, non sông rạng rỡ!",
    isOfficialHoliday: false
  },
  // --- THÁNG 9 ---
  {
    id: "quoc-khanh-vn",
    title: "Quốc khánh Việt Nam (2/9)",
    shortTitle: "Quốc khánh 2/9",
    isLunar: false,
    day: 2,
    month: 9,
    theme: "national",
    category: "Lễ lớn",
    desc: "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình lịch sử.",
    wishes: "Mừng ngày Tết Độc Lập thiêng liêng! Chúc Việt Nam luôn thái bình, thịnh vượng!",
    isOfficialHoliday: true
  },
  // --- THÁNG 10 ---
  {
    id: "giai-phong-thu-do",
    title: "Ngày Giải phóng Thủ đô (10/10)",
    shortTitle: "Giải phóng Thủ đô",
    isLunar: false,
    day: 10,
    month: 10,
    theme: "national",
    category: "Kỷ niệm",
    desc: "Đoàn quân chiến thắng tiến về tiếp quản Thủ đô Hà Nội ngàn năm văn hiến.",
    wishes: "Hà Nội - Trái tim của cả nước, Thành phố vì Hòa bình ngàn năm văn hiến!",
    isOfficialHoliday: false
  },
  {
    id: "doanh-nhan-vn",
    title: "Ngày Doanh nhân Việt Nam",
    shortTitle: "Doanh nhân VN",
    isLunar: false,
    day: 13,
    month: 10,
    theme: "default",
    category: "Kỷ niệm",
    desc: "Tôn vinh đội ngũ doanh nhân bản lĩnh, chèo lái con thuyền kinh tế đất nước.",
    wishes: "Chúc các doanh nhân luôn vững tay chèo, gặt hái thành công và đưa đất nước vươn xa!",
    isOfficialHoliday: false
  },
  {
    id: "phu-nu-vn-20-10",
    title: "Ngày Phụ nữ Việt Nam (20/10)",
    shortTitle: "Phụ nữ VN 20/10",
    isLunar: false,
    day: 20,
    month: 10,
    theme: "pink",
    category: "Tôn vinh",
    desc: "Ngày cả nước tôn vinh người phụ nữ Việt Nam: Anh hùng, Bất khuất, Trung hậu, Đảm đang.",
    wishes: "Chúc tất cả các bà, các mẹ, các chị và các bạn gái luôn ngập tràn nụ cười, hạnh phúc và nhận được ngàn đóa hồng thơm ngát!",
    isOfficialHoliday: false
  },
  {
    id: "halloween",
    title: "Lễ hội Halloween",
    shortTitle: "Halloween",
    isLunar: false,
    day: 31,
    month: 10,
    theme: "halloween",
    category: "Lễ hội",
    desc: "Đêm hóa trang huyền bí, tiệc bí ngô đèn lồng và những câu chuyện kỳ thú.",
    wishes: "Chúc bạn một đêm Halloween rùng rợn vui vẻ, nhiều kẹo ngọt và những màn hóa trang ấn tượng!",
    isOfficialHoliday: false
  },
  // --- THÁNG 11 ---
  {
    id: "nha-giao-vn",
    title: "Ngày Nhà giáo Việt Nam (20/11)",
    shortTitle: "Nhà giáo 20/11",
    isLunar: false,
    day: 20,
    month: 11,
    theme: "pink",
    category: "Tri ân",
    desc: "Ngày lễ tôn sư trọng đạo, tri ân những người thầy người cô lái đò thầm lặng.",
    wishes: "Kính chúc thầy cô luôn dồi dào sức khỏe, nhiệt huyết và hạnh phúc trên con đường gieo mầm tri thức!",
    isOfficialHoliday: false
  },
  // --- THÁNG 12 ---
  {
    id: "quan-doi-ndvn",
    title: "Ngày Thành lập Quân đội Nhân dân VN (22/12)",
    shortTitle: "QĐND Việt Nam",
    isLunar: false,
    day: 22,
    month: 12,
    theme: "national",
    category: "Tri ân",
    desc: "Kỷ niệm ngày truyền thống Bộ đội Cụ Hồ, lực lượng vũ trang nhân dân anh hùng.",
    wishes: "Chúc các chiến sĩ đang công tác luôn vững vàng nơi đầu sóng ngọn gió bảo vệ Tổ quốc!",
    isOfficialHoliday: false
  },
  {
    id: "giang-sinh-noel",
    title: "Lễ Giáng Sinh (Noel)",
    shortTitle: "Giáng Sinh Noel",
    isLunar: false,
    day: 24,
    month: 12,
    theme: "noel",
    category: "Lễ hội",
    desc: "Đêm thánh an lành, cây thông lấp lánh và quà tặng ngọt ngào từ ông già Noel.",
    wishes: "Merry Christmas! Chúc bạn và gia đình một mùa Giáng Sinh ấm áp, an lành và hạnh phúc!",
    isOfficialHoliday: false
  },

  // =========================================================================
  // SỰ KIỆN ÂM LỊCH (LUNAR EVENTS)
  // =========================================================================
  {
    id: "ong-tao",
    title: "Tết Táo Quân (23 tháng Chạp)",
    shortTitle: "Ông Táo chầu trời",
    isLunar: true,
    day: 23,
    month: 12,
    theme: "tet",
    category: "Truyền thống",
    desc: "Tiễn Táo Quân cưỡi cá chép đỏ về chầu trời, báo cáo công việc cả năm của gia đình.",
    wishes: "Chúc gia đình đón ông Táo vui tươi, sắm sửa mâm cúng chu tất rước vạn điều may!",
    isOfficialHoliday: false
  },
  {
    id: "giao-thua",
    title: "Đêm Giao Thừa (Tất Niên)",
    shortTitle: "Đêm Giao Thừa",
    isLunar: true,
    day: 30, // Có năm tháng thiếu là 29
    month: 12,
    theme: "tet",
    category: "Lễ lớn",
    desc: "Thời khắc thiêng liêng chuyển giao năm cũ sang năm mới, pháo hoa rực sáng đất trời.",
    wishes: "Chúc mừng năm mới! Khép lại muộn phiền, đón chào bình an, tài lộc ngập tràn!",
    isOfficialHoliday: true
  },
  {
    id: "mung-1-tet",
    title: "Mùng 1 Tết Nguyên Đán",
    shortTitle: "Mùng 1 Tết",
    isLunar: true,
    day: 1,
    month: 1,
    theme: "tet",
    category: "Lễ lớn",
    desc: "Ngày đầu tiên của năm mới âm lịch. Mùng 1 Tết Cha, mâm cơm gia đình ấm cúng.",
    wishes: "Năm mới vạn sự như ý, tỷ sự như mơ, triệu điều bất ngờ, ngập tràn hạnh phúc!",
    isOfficialHoliday: true
  },
  {
    id: "mung-2-tet",
    title: "Mùng 2 Tết Nguyên Đán",
    shortTitle: "Mùng 2 Tết",
    isLunar: true,
    day: 2,
    month: 1,
    theme: "tet",
    category: "Lễ lớn",
    desc: "Mùng hai Tết Mẹ. Con cháu sum vầy chúc thọ ông bà, đón xuân nồng ấm.",
    wishes: "Chúc gia đình năm mới sức khỏe dồi dào, phát tài phát lộc!",
    isOfficialHoliday: true
  },
  {
    id: "mung-3-tet",
    title: "Mùng 3 Tết Nguyên Đán",
    shortTitle: "Mùng 3 Tết",
    isLunar: true,
    day: 3,
    month: 1,
    theme: "tet",
    category: "Lễ lớn",
    desc: "Mùng ba Tết Thầy. Nét đẹp truyền thống nhớ ơn người đã khai tâm mở trí.",
    wishes: "Xuân sang rực rỡ, may mắn quanh năm!",
    isOfficialHoliday: true
  },
  {
    id: "ram-thang-gieng",
    title: "Rằm Tháng Giêng (Tết Nguyên Tiêu)",
    shortTitle: "Rằm Tháng Giêng",
    isLunar: true,
    day: 15,
    month: 1,
    theme: "midautumn",
    category: "Truyền thống",
    desc: "Cúng cả năm không bằng Rằm tháng Giêng, ngày hội hoa đăng cầu quốc thái dân an.",
    wishes: "Nguyện cầu một năm mưa thuận gió hòa, lòng người thanh thản, vạn sự bình yên!",
    isOfficialHoliday: false
  },
  {
    id: "gio-to-hung-vuong",
    title: "Giỗ Tổ Hùng Vương (10/3 ÂL)",
    shortTitle: "Giỗ Tổ Hùng Vương",
    isLunar: true,
    day: 10,
    month: 3,
    theme: "national",
    category: "Lễ lớn",
    desc: "Dù ai đi ngược về xuôi, nhớ ngày Giỗ Tổ mùng mười tháng ba. Tri ân công đức Vua Hùng.",
    wishes: "Tự hào dòng máu Lạc Hồng, đoàn kết dựng xây đất nước hùng cường!",
    isOfficialHoliday: true
  },
  {
    id: "phat-dan",
    title: "Đại lễ Phật Đản (15/4 ÂL)",
    shortTitle: "Lễ Phật Đản",
    isLunar: true,
    day: 15,
    month: 4,
    theme: "default",
    category: "Tâm linh",
    desc: "Kỷ niệm ngày Đức Phật Thích Ca Mâu Ni đản sinh, ngày hội từ bi hỷ xả.",
    wishes: "Chúc mọi người tâm luôn an nhiên, hướng thiện và gieo mầm phúc đức!",
    isOfficialHoliday: false
  },
  {
    id: "tet-doan-ngo",
    title: "Tết Đoan Ngọ (5/5 ÂL)",
    shortTitle: "Tết Đoan Ngọ (Diệt sâu bọ)",
    isLunar: true,
    day: 5,
    month: 5,
    theme: "default",
    category: "Truyền thống",
    desc: "Tết diệt sâu bọ, ăn cơm rượu nếp, bánh tro và quả chín trừ độc đón may.",
    wishes: "Mùa Đoan Ngọ dồi dào sức khỏe, gia đình sum vầy no ấm!",
    isOfficialHoliday: false
  },
  {
    id: "vu-lan",
    title: "Lễ Vu Lan Báo Hiếu (15/7 ÂL)",
    shortTitle: "Vu Lan Báo Hiếu",
    isLunar: true,
    day: 15,
    month: 7,
    theme: "pink",
    category: "Truyền thống",
    desc: "Bông hồng cài áo tri ân công đức sinh thành dưỡng dục vô bờ của Cha Mẹ.",
    wishes: "Nguyện chúc Cha Mẹ luôn an khang, trường thọ cùng con cháu!",
    isOfficialHoliday: false
  },
  {
    id: "tet-trung-thu",
    title: "Tết Trung Thu (15/8 ÂL)",
    shortTitle: "Tết Trung Thu",
    isLunar: true,
    day: 15,
    month: 8,
    theme: "midautumn",
    category: "Lễ hội",
    desc: "Tết đoàn viên, rước đèn ông sao, ngắm chú Cuội chị Hằng và phá cỗ trăng rằm.",
    wishes: "Trung Thu ấm áp bên người thương, chúc tuổi thơ mãi lung linh sắc màu đèn kéo quân!",
    isOfficialHoliday: false
  }
];

/**
 * Tính ngày Dương lịch tương ứng cho sự kiện trong một năm cụ thể
 */
export function getSolarDateForEvent(event, solarYear) {
  if (!event.isLunar) {
    return {
      day: event.day,
      month: event.month,
      year: solarYear,
      dateObj: new Date(solarYear, event.month - 1, event.day)
    };
  }

  // Nếu là sự kiện Âm lịch: Quét các ngày trong năm để tìm ngày có [lunarDay === event.day, lunarMonth === event.month]
  // Bắt đầu từ 1/1 năm solarYear đến 28/2 năm solarYear + 1
  const startJd = jdFromDate(1, 1, solarYear);
  const endJd = jdFromDate(28, 2, solarYear + 1);

  for (let j = startJd; j <= endJd; j++) {
    const [d, m, y] = jdToDate(j);
    const [ld, lm] = convertSolar2Lunar(d, m, y);
    if (ld === event.day && lm === event.month) {
      // Đối với tháng chạp (tháng 12 âm lịch), nếu là tất niên thì tính theo năm âm
      return {
        day: d,
        month: m,
        year: y,
        dateObj: new Date(y, m - 1, d)
      };
    }
  }

  return {
    day: event.day,
    month: event.month,
    year: solarYear,
    dateObj: new Date(solarYear, event.month - 1, event.day)
  };
}

/**
 * Lấy các sự kiện diễn ra vào một ngày cụ thể (cả Dương lịch và Âm lịch)
 */
export function getEventsForSpecificDate(dd, mm, yy) {
  const [ld, lm] = convertSolar2Lunar(dd, mm, yy);

  return VIETNAM_EVENTS.filter((e) => {
    if (e.isLunar) {
      return e.day === ld && e.month === lm;
    }
    return e.day === dd && e.month === mm;
  });
}

/**
 * Lấy danh sách các sự kiện sắp tới gần nhất (sắp xếp theo thời gian)
 */
export function getUpcomingEvents(now = new Date(), limit = 6) {
  const currentYear = now.getFullYear();
  const todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const mapped = [];

  // Duyệt qua năm hiện tại và năm kế tiếp
  [currentYear, currentYear + 1].forEach((y) => {
    VIETNAM_EVENTS.forEach((e) => {
      const solar = getSolarDateForEvent(e, y);
      const diffTime = solar.dateObj.getTime() - todayTime;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        mapped.push({
          ...e,
          calculatedSolar: solar,
          daysLeft: diffDays,
          isToday: diffDays === 0
        });
      }
    });
  });

  // Sắp xếp theo ngày gần nhất
  mapped.sort((a, b) => a.daysLeft - b.daysLeft);

  // Lọc trùng theo id (chỉ giữ lần diễn ra gần nhất)
  const seen = new Set();
  const result = [];
  for (const item of mapped) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
    if (result.length >= limit) break;
  }

  return result;
}

/**
 * Tự động xác định theme phù hợp nhất cho ngày hiện tại
 */
export function getDefaultThemeForDate(now = new Date()) {
  const dd = now.getDate();
  const mm = now.getMonth() + 1;
  const [ld, lm] = convertSolar2Lunar(dd, mm, now.getFullYear());

  // 1. Kiểm tra sự kiện ngày hôm nay
  const todayEvents = getEventsForSpecificDate(dd, mm, now.getFullYear());
  if (todayEvents.length > 0) {
    return todayEvents[0].theme;
  }

  // 2. Kiểm tra các khoảng thời gian lễ hội gần kề:
  // Tháng 10: 15/10 - 21/10 -> Theme Hồng 20/10
  if (mm === 10 && dd >= 15 && dd <= 21) return "pink";
  // Cuối tháng 10: 25/10 - 31/10 -> Theme Halloween
  if (mm === 10 && dd >= 25 && dd <= 31) return "halloween";
  // Tháng 3: 1/3 - 9/3 -> Theme Hồng 8/3
  if (mm === 3 && dd >= 1 && dd <= 9) return "pink";
  // Tháng 11: 15/11 - 21/11 -> Theme Hồng 20/11
  if (mm === 11 && dd >= 15 && dd <= 21) return "pink";
  // Tháng 12: 18/12 - 26/12 -> Theme Noel
  if (mm === 12 && dd >= 18 && dd <= 26) return "noel";
  // Tết Nguyên Đán: 23 tháng Chạp đến mùng 5 Tết
  if ((lm === 12 && ld >= 22) || (lm === 1 && ld <= 6)) return "tet";
  // Trung Thu: 10/8 - 16/8 Âm lịch
  if (lm === 8 && ld >= 10 && ld <= 16) return "midautumn";
  // 30/4 & 1/5: 28/4 - 2/5
  if ((mm === 4 && dd >= 28) || (mm === 5 && dd <= 2)) return "national";
  // 2/9: 30/8 - 3/9
  if ((mm === 8 && dd >= 30) || (mm === 9 && dd <= 3)) return "national";

  return "default";
}
