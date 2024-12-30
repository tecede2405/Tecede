import Tabbar from '../../component/tabar';
function Contact() {
    return (
        <>
           <div className="contact">
            <Tabbar />
            <div className="contact__content">
                <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdVW0M3bVFC9P9duBxMJD3DOkdGY0bSDLd6kKcFMSw6ViAJRg/viewform?embedded=true" 
                width="100%" 
                height="1000px"
                style={{ margin: '30px 0 0 0' }} 
                frameborder="0"
                scrolling="no"
                marginheight="0" 
                marginwidth="0"
                >
                Đang tải…
                </iframe>
            </div> 
           </div>
        </>
    )
}

export default Contact;