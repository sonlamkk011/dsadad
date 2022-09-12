import { useEffect, useState } from 'react'
import { Breadcrumb, Typography, message, Avatar, Spin, Row, Col } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchGetPostById } from '../../../service/SocialPosts/SocialPosts';
import { convertTimestamp } from '../../../Hooks/TimestampConverter';
import { t } from 'i18next';

const { Title } = Typography;

function PreviewPost() {
    const navigate = useNavigate();
    const postId = window.location.pathname.split('/')[3];
    const [isContentLoading, setisContentLoading] = useState(false)
    const [postDetails, setpostDetails] = useState<any>();

    useEffect(() => {
        getPostDetails()
    }, []);

    const getPostDetails = async () => {
        setisContentLoading(true);
        const response = await fetchGetPostById(postId, setisContentLoading);
        if (response) {
            if (response.status === 200) {
                const postDetails = response.data
                setpostDetails(postDetails);
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t('Get post details failed'));
        }
    }

    return (
        <div id='preview-post'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("preview")}</Title>
                <Breadcrumb >
                    <Breadcrumb.Item>{t("social-post")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("preview")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                <div className='d-flex justify-content-center'>
                    <div className='border' style={{ width: '1227px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <div style={{ padding: '30px' }}>
                            <Spin spinning={isContentLoading}>
                                {/* Avatar + title + author name + post time */}
                                <section>
                                    <div className='d-flex align-items-end'>
                                        <Avatar shape="square" size={46} icon={<UserOutlined />} />
                                        <span className='ms-3' style={{ fontWeight: '500', fontSize: '20px' }}>
                                            {postDetails?.title}
                                        </span>
                                    </div>
                                    <div className='mt-2'>
                                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{postDetails?.authorName}</span> - <span>{convertTimestamp(Date.parse(postDetails?.createdAt))}</span>
                                    </div>
                                </section>

                                {/* Content */}
                                <section className='mt-4'>
                                    <div
                                        style={{ fontSize: '18px' }}
                                        dangerouslySetInnerHTML={{ __html: postDetails?.content }}
                                    />
                                </section>

                                {/* Images */}
                                <section className='mt-4'>
                                    <Row>
                                        {
                                            postDetails?.detail?.images.map((image: any, index: number) => {
                                                return (
                                                    <Col key={index} span={12} className="p-2">
                                                        <img src={image} alt='post' style={{ width: '100%', height: "300px" }} />
                                                    </Col>
                                                )
                                            })
                                        }
                                    </Row>
                                </section>
                            </Spin>
                        </div>
                    </div>
                </div>
                <div className='mt-4 text-center'>
                    <button className='bottom-button me-3' onClick={() => navigate(`/posts/edit/${postId}`)}>{t("Edit")}</button>
                </div>
            </div>
        </div >
    )
}

export default PreviewPost