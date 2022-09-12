import { Button, Empty, message, Modal, Radio, Space, Table } from 'antd'
import { t } from 'i18next';
import React, { useState } from 'react'
import { fetchInfinitePreviewCrawlLinks, fetchPreviewCrawlLinks } from '../../../../service/Sources/sources';

function LinkPreview({ form, isInfiniteCrawl }: any) {
    const [previewButtonLoading, setpreviewButtonLoading] = useState(false);
    const [urls, seturls] = useState<any>([]);
    const [urlResult, seturlResult] = useState("");
    const [showType, setshowType] = useState("list");

    // For modal
    const [isModalVisible, setIsModalVisible] = useState(false);

    // For modal
    const handleNormalPreviewButton = () => {
        const formValue = form.getFieldsValue();
        const { linkHomepage, linkSelector, path } = formValue
        if (linkHomepage && linkSelector && path) {
            executePreview({ linkHomepage, linkSelector, path })
        } else {
            if (!linkHomepage) {
                form.setFields([
                    {
                        name: 'linkHomepage',
                        errors: [`${t("please-input")} ${t("domain").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
            if (!linkSelector) {
                form.setFields([
                    {
                        name: 'linkSelector',
                        errors: [`${t("please-input")} ${t("Link Detail Selector").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
            if (!path) {
                form.setFields([
                    {
                        name: 'path',
                        errors: [`${t("please-input")} ${t("path").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
        }
    }

    const handleInfinitePreviewButton = () => {
        const formValue = form.getFieldsValue();
        const { linkHomepage, linkSelector, path, nextPage } = formValue
        if (linkHomepage && linkSelector && path && nextPage) {
            executePreview({ linkHomepage, linkSelector, path, nextPage })
        } else {
            if (!linkHomepage) {
                form.setFields([
                    {
                        name: 'linkHomepage',
                        errors: [`${t("please-input")} ${t("domain").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
            if (!linkSelector) {
                form.setFields([
                    {
                        name: 'linkSelector',
                        errors: [`${t("please-input")} ${t("Link Detail Selector").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
            if (!path) {
                form.setFields([
                    {
                        name: 'path',
                        errors: [`${t("please-input")} ${t("path").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
            if (!nextPage) {
                form.setFields([
                    {
                        name: 'nextPage',
                        errors: [`${t("please-input")} ${t("Next-page param").toLowerCase()} ${t("to preview")}!`],
                    },
                ]);
            }
        }
    }

    const executePreview = async (values: any) => {
        setpreviewButtonLoading(true);
        let response
        if (isInfiniteCrawl) {
            response = await fetchInfinitePreviewCrawlLinks(values, setpreviewButtonLoading);
        } else {
            response = await fetchPreviewCrawlLinks(values, setpreviewButtonLoading);
        }
        if (response) {
            if (response.status === 200) {
                const responseData = response.data.data
                const result = JSON.parse(response.data.result)
                seturlResult(result.urls);
                const dataWithKey: any = []
                responseData.forEach((element: any, index: any) => {
                    dataWithKey.push({
                        url: element,
                        key: index,
                        id: index + 1,
                    })
                })
                seturls(dataWithKey)
                setIsModalVisible(true);
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Can not get preview data'))
        }
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
        },
    ];

    return (
        <Space className='d-flex justify-content-center'>
            <Button type='primary' loading={previewButtonLoading} onClick={isInfiniteCrawl ? handleInfinitePreviewButton : handleNormalPreviewButton}>
                {t("preview")}
            </Button>
            <Modal
                title={t("Preview URL Crawler")}
                visible={isModalVisible}
                centered
                onOk={handleOk}
                onCancel={handleCancel}
                width={urls && urls.length > 0 ? 1400 : 500}
                footer={null}
            >
                <Radio.Group className='mb-3' onChange={(e: any) => setshowType(e.target.value)}>
                    <Radio.Button value="list">{t("Show list")}</Radio.Button>
                    <Radio.Button value="html">{t("Show HTML")}</Radio.Button>
                </Radio.Group>
                {
                    showType === "list" ?
                        (
                            urls && urls.length > 0 ?
                                <Table dataSource={urls} columns={columns} />
                                :
                                (
                                    urlResult ?
                                        <div className='text-center'>
                                            urlResult
                                        </div>
                                        :
                                        <Empty
                                            description={
                                                <span>
                                                    {t("No preview data")}
                                                </span>
                                            }
                                        />
                                )
                        )
                        :
                        (
                            <div>
                                {/* break line for every "><" but keep the "><" */}
                                {urlResult.split(/>\s*</).map((element: any, index: any) => {
                                    return <div key={index}>{index === 0 ? "" : "<"}{element}{">"}</div>

                                })}
                            </div>
                        )
                }
            </Modal>
        </Space>
    )
}

export default LinkPreview