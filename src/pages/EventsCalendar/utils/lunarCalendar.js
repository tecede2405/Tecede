/**
 * Thuật toán chuyển đổi Dương lịch <-> Âm lịch Việt Nam chuẩn xác (Múi giờ UTC+7)
 * Dựa trên thuật toán thiên văn học của Hồ Ngọc Đức
 */

function INT(d) {
  return Math.floor(d);
}

// Chuyển đổi ngày sang Julian Day
export function jdFromDate(dd, mm, yy) {
  let a = INT((14 - mm) / 12);
  let y = yy + 4800 - a;
  let m = mm + 12 * a - 3;
  return (
    dd +
    INT((153 * m + 2) / 5) +
    365 * y +
    INT(y / 4) -
    INT(y / 100) +
    INT(y / 400) -
    32045
  );
}

// Chuyển đổi Julian Day sang ngày Dương lịch [dd, mm, yy]
export function jdToDate(jd) {
  let a = jd + 32044;
  let b = INT((4 * a + 3) / 146097);
  let c = a - INT((146097 * b) / 4);
  let d = INT((4 * c + 3) / 1461);
  let e = c - INT((1461 * d) / 4);
  let m = INT((5 * e + 2) / 153);
  let day = e - INT((153 * m + 2) / 5) + 1;
  let month = m + 3 - 12 * INT(m / 10);
  let year = 100 * b + d - 4800 + INT(m / 10);
  return [day, month, year];
}

// Tính ngày Sóc (New Moon) theo chu kỳ k
function getNewMoonDay(k, timeZone = 7) {
  let T = k / 1236.85;
  let T2 = T * T;
  let T3 = T2 * T;
  let dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 = C1 - 0.0004 * Math.sin(3 * dr * Mpr);
  C1 =
    C1 +
    0.0104 * Math.sin(2 * dr * F) -
    0.0051 * Math.sin((M + Mpr) * dr);
  C1 =
    C1 -
    0.0074 * Math.sin((M - Mpr) * dr) +
    0.0004 * Math.sin((2 * F + M) * dr);
  C1 =
    C1 -
    0.0004 * Math.sin((2 * F - M) * dr) -
    0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 =
    C1 +
    0.001 * Math.sin((2 * F - Mpr) * dr) +
    0.0005 * Math.sin((2 * Mpr + M) * dr);
  let JdNew = Jd1 + C1;
  return INT(JdNew + 0.5 + timeZone / 24);
}

// Kinh độ mặt trời (Sun Longitude)
function getSunLongitude(jdn, timeZone = 7) {
  let T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  let dr = Math.PI / 180;
  let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T * T;
  let M = 357.5291 + 35999.05029 * T - 0.0001537 * T * T;
  let C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * dr);
  C =
    C +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) +
    0.000289 * Math.sin(3 * M * dr);
  let theta = L0 + C;
  theta = theta * dr;
  theta = theta - Math.PI * 2 * INT(theta / (Math.PI * 2));
  return INT((theta / Math.PI) * 6);
}

// Tìm ngày bắt đầu tháng 11 âm lịch
function getLunarMonth11(yy, timeZone = 7) {
  let off = jdFromDate(31, 12, yy) - 2415021;
  let k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  let sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

// Xác định tháng nhuận
function getLeapMonthOffset(a11, timeZone = 7) {
  let k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Chuyển đổi ngày Dương lịch sang Âm lịch
 * @returns {Array} [lunarDay, lunarMonth, lunarYear, isLeap]
 */
export function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
  let dayNumber = jdFromDate(dd, mm, yy);
  let k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear = yy;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    let nextA11 = getLunarMonth11(yy + 1, timeZone);
    if (nextA11 <= monthStart) {
      lunarYear = yy + 1;
      b11 = nextA11;
    }
  }
  let lunarDay = dayNumber - monthStart + 1;
  let diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    let leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

// 10 Can và 12 Chi
const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CON_GIAP = [
  "Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn",
  "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"
];

// 24 Tiết khí
const TIET_KHI = [
  "Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng",
  "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ",
  "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết",
  "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"
];

// Lấy Can Chi năm
export function getCanChiYear(lunarYear) {
  const canIndex = (lunarYear + 6) % 10;
  const chiIndex = (lunarYear + 8) % 12;
  return {
    canChi: `${CAN[canIndex]} ${CHI[chiIndex]}`,
    conGiap: CON_GIAP[chiIndex],
    can: CAN[canIndex],
    chi: CHI[chiIndex]
  };
}

// Lấy Can Chi ngày
export function getCanChiDay(dd, mm, yy) {
  const jd = jdFromDate(dd, mm, yy);
  const canIndex = (jd + 9) % 10;
  const chiIndex = (jd + 1) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

// Lấy Can Chi tháng âm lịch
export function getCanChiMonth(lunarMonth, lunarYear) {
  const canYearIndex = (lunarYear + 6) % 10;
  const canMonthIndex = (canYearIndex * 2 + lunarMonth) % 10;
  const chiMonthIndex = (lunarMonth + 1) % 12;
  return `${CAN[canMonthIndex]} ${CHI[chiMonthIndex]}`;
}

// Lấy Tiết khí hiện tại
export function getSolarTerm(dd, mm, yy) {
  const jd = jdFromDate(dd, mm, yy);
  const sunLong = getSunLongitude(jd);
  return TIET_KHI[sunLong] || "Bình thường";
}

// Các khung giờ hoàng đạo cho từng Chi của ngày
const HOANG_DAO_MAP = {
  "Tý": ["Tý (23-1)", "Sửu (1-3)", "Mão (5-7)", "Ngọ (11-13)", "Thân (15-17)", "Dậu (17-19)"],
  "Sửu": ["Dần (3-5)", "Mão (5-7)", "Tỵ (9-11)", "Thân (15-17)", "Tuất (19-21)", "Hợi (21-23)"],
  "Dần": ["Tý (23-1)", "Sửu (1-3)", "Thìn (7-9)", "Tỵ (9-11)", "Mùi (13-15)", "Tuất (19-21)"],
  "Mão": ["Tý (23-1)", "Dần (3-5)", "Mão (5-7)", "Ngọ (11-13)", "Mùi (13-15)", "Dậu (17-19)"],
  "Thìn": ["Dần (3-5)", "Thìn (7-9)", "Tỵ (9-11)", "Thân (15-17)", "Dậu (17-19)", "Hợi (21-23)"],
  "Tỵ": ["Sửu (1-3)", "Thìn (7-9)", "Ngọ (11-13)", "Mùi (13-15)", "Tuất (19-21)", "Hợi (21-23)"],
  "Ngọ": ["Tý (23-1)", "Sửu (1-3)", "Mão (5-7)", "Ngọ (11-13)", "Thân (15-17)", "Dậu (17-19)"],
  "Mùi": ["Dần (3-5)", "Mão (5-7)", "Tỵ (9-11)", "Thân (15-17)", "Tuất (19-21)", "Hợi (21-23)"],
  "Thân": ["Tý (23-1)", "Sửu (1-3)", "Thìn (7-9)", "Tỵ (9-11)", "Mùi (13-15)", "Tuất (19-21)"],
  "Dậu": ["Tý (23-1)", "Dần (3-5)", "Mão (5-7)", "Ngọ (11-13)", "Mùi (13-15)", "Dậu (17-19)"],
  "Tuất": ["Dần (3-5)", "Thìn (7-9)", "Tỵ (9-11)", "Thân (15-17)", "Dậu (17-19)", "Hợi (21-23)"],
  "Hợi": ["Sửu (1-3)", "Thìn (7-9)", "Ngọ (11-13)", "Mùi (13-15)", "Tuất (19-21)", "Hợi (21-23)"],
};

export function getAuspiciousHours(dd, mm, yy) {
  const jd = jdFromDate(dd, mm, yy);
  const chiIndex = (jd + 1) % 12;
  const chiName = CHI[chiIndex];
  return HOANG_DAO_MAP[chiName] || ["Tý", "Sửu", "Thìn", "Tỵ", "Mùi", "Tuất"];
}
