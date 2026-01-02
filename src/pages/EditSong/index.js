import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Card, InputNumber } from "antd";
import Swal from "sweetalert2";
import "./style.scss";

const { Option } = Select;

export default function EditSong() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/songs/${id}`
        );
        const json = await res.json();
        const song = json.data || json;

        form.setFieldsValue({
          title: song.title,
          artist: song.artist,
          image: song.image,
          file: song.file,
          category: song.category,
          listens: song.listens,
        });
      } catch (err) {
        Swal.fire("Lỗi", "Không tải được bài hát", "error");
      }
    };

    fetchSong();
  }, [id, form]);

  // ================= SUBMIT =================
  const onFinishConfirm = async (values) => {
  const result = await Swal.fire({
    title: "Xác nhận cập nhật?",
    text: "Bạn có chắc chắn muốn lưu các thay đổi này không?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Cập nhật",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#1677ff",
  });

  if (!result.isConfirmed) return;

  try {
    setLoading(true);

    await fetch(`${process.env.REACT_APP_API_URL}/api/songs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    await Swal.fire({
      icon: "success",
      title: "Thành công",
      text: "Bạn đã cập nhật bài hát thành công!",
      timer: 1200,
      showConfirmButton: false,
    });

    navigate(-1);
  } catch {
    Swal.fire("Lỗi", "Cập nhật thất bại", "error");
  } finally {
    setLoading(false);
  }
};


  // ================= UI =================
  return (
    <Card title="Chỉnh sửa bài hát" style={{ maxWidth: 700, margin: "auto" }} className="edit-song-form text-light">
      <Form key={id} layout="vertical" form={form} onFinish={onFinishConfirm}>
        <Form.Item label="Tên bài hát" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Ca sĩ" name="artist" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Link hình ảnh"
          name="image"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Link MP3"
          name="file"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="nhactre">Nhạc Trẻ</Option>
            <Option value="nhacusuk">Nhạc Âu Mỹ</Option>
            <Option value="nhactreremix">Nhạc Remix</Option>
            <Option value="nhactrungquoc">Nhạc Trung Quốc</Option>
            <Option value="nhacdouyin">Nhạc Douyin</Option>
            <Option value="nhacedm">Nhạc EDM</Option>
            <Option value="nhacphonk">Nhạc Phonk</Option>
            <Option value="nhackhongloi">Nhạc Không Lời</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Lượt nghe" name="listens">
          <InputNumber disabled style={{ width: "100%" }} className="no-edit" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={async () => {
              const result = await Swal.fire({
                title: "Hủy chỉnh sửa?",
                text: "Mọi thay đổi chưa lưu sẽ bị mất",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Rời đi",
                cancelButtonText: "Ở lại",
              });

              if (result.isConfirmed) navigate(-1);
            }}
          >
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
