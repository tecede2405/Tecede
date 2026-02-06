import { getHistory } from "../../utils/history";
import { useNavigate } from "react-router-dom";

export default function WatchHistory() {
  const history = getHistory();
  const navigate = useNavigate();

  const handleClick = (slug) => {
    navigate(`/film/${slug}`);
  };

  return (
    <div className="container py-4">
      <h3 className="text-light mb-3 border-bottom pb-2">
        Lịch sử đã xem
      </h3>

      {history.length === 0 && (
        <p className="text-light">Chưa có phim nào</p>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <tbody>
            {history.map((item) => (
              <tr
                key={item.path}
                style={{ cursor: "pointer" }}
                onClick={() => handleClick(item.path)}
              >
                <td style={{ width: "70px" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    width="50"
                    height="70"
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                </td>

                <td>
                  <span className="fw-semibold">
                    {item.title}
                  </span>
                </td>

                <td className="text-end text-secondary small">
                  Xem lại →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
