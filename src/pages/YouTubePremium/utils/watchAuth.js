import Swal from "sweetalert2";

export const DarkSwal = Swal.mixin({
  background: "#1f1f1f",
  color: "#fff",
  confirmButtonColor: "#f59e0b",
  cancelButtonColor: "#334155",
  customClass: {
    popup: "swal-dark",
    title: "swal-title",
    htmlContainer: "swal-text",
    confirmButton: "swal-confirm",
  },
});

export const checkYtWatchAccess = (user, navigate) => {
  if (!user) {
    DarkSwal.fire({
      icon: "warning",
      title: "Yêu cầu đăng nhập",
      text: "Vui lòng đăng nhập tài khoản để sử dụng tính năng xem YouTube không quảng cáo!",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập ngay",
      cancelButtonText: "Để sau",
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#334155",
    }).then((result) => {
      if (result.isConfirmed && navigate) {
        navigate("/login");
      }
    });
    return false;
  }

  if (user.role !== "premium" && user.role !== "admin") {
    DarkSwal.fire({
      icon: "info",
      title: "Đặc quyền Premium",
      text: "Tính năng này chỉ dành cho thành viên Premium!",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#f59e0b",
    });
    return false;
  }

  return true;
};
