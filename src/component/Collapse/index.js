import { Collapse } from 'antd';
import "./collapsed.scss";

function Collapsed(){

    const items = [
        {
          key: '1',
          label: 'Tiêu đề 1',
          children: <p>"Bạn cũng có thể nghe nhạc trong lúc tìm hiểu trang này bằng cách click vào chữ <strong>"Bật Nhạc"</strong> trên góc trái kế bên logo."</p>,
        },
        {
          key: '2',
          label: 'Tiêu đề 2',
          children: <p>"Blog này không chỉ là câu chuyện của mình, mà còn là động lực dành cho bạn. Nếu bạn đang đọc những dòng chữ này thì mình mong bạn cũng cố gắng lên và đạt được mục tiêu cho bản thân mình nhé !"</p>,
        },
        {
          key: '3',
          label: 'Tiêu đề 3',
          children: <p>"Nếu bạn yêu thích nội dung tại đây hay có góp ý gì cứ ib trực tiếp mình nhé, mình sẽ sửa lại để hoàn thiện hơn."</p>,
        },
      ];
    return(
        <>
        <div className="collapsed">
          <div className="collapsed__header">
            <h2 className="mb-3 text-center">Tiêu đề chính</h2>
          </div>
            <Collapse items={items} defaultActiveKey={['1']} size={"middle"} accordion />
        </div>
              
        </>
    )
    
}

export default Collapsed;