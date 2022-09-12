import { ProTable } from '@ant-design/pro-components';
import { Table, message, Breadcrumb, Typography, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchJSONGetAllData } from '../../../service/SEO/JSONLD';
import EditJSONDataModal from './EditJSONDataModal';

const { Title } = Typography;

function JSONAll() {
  const [JSONData, setJSONData] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedRowData, setselectedRowData] = useState<any>();
  const [demoText, setdemoText] = useState("");
  // For modal
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getAllJSONData()
  }, []);

  const getAllJSONData = async () => {
    setLoading(true)
    const response = await fetchJSONGetAllData(setLoading)
    if (response) {
      if (response.status === 200) {
        const dataWithKey: any = [];
        response.data.forEach((element: any) => {
          dataWithKey.push({
            ...element,
            key: element.id
          })
        })
        setJSONData(dataWithKey)
        setdemoText(JSON.stringify(response.data[0]));
      } else {
        message.error(response.data)
      }
    } else {
      message.error('Get all JSON data failed')
    }
  }

  const handleEditButton = (rowData: any) => {
    setVisible(true)
    setselectedRowData(rowData)
  }

  const columns: any = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (_: any, record: any) => (
        <img src={record.image} alt="image" width="100" height="100" />
      ),
      responsive: ["lg", "xl", "xxl"]
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (_: any, record: any) => (
        <span>{record.type}</span>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: any) => (
        <span>{record.name}</span>
      )
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (_: any, record: any) => (
        <span>{record.url}</span>
      )
    },
    {
      title: 'Price Range',
      dataIndex: 'priceRange',
      key: 'priceRange',
      render: (_: any, record: any) => (
        <span>{record.priceRange}</span>
      )
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      key: 'edit',
      render: (_: any, row: any) => (
        <button className='edit-button' onClick={() => handleEditButton(row)}>Edit</button>
      ),
    },
  ];

  return (
    <div id='JSON-all-data'>
      <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
        <Title level={4}>JSON data list</Title>
        <Breadcrumb>
          <Breadcrumb.Item>JSON data</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
        <ProTable
          loading={loading}
          columns={columns}
          dataSource={JSONData}
          pagination={false}
        />
        <div className='mt-4' style={{ fontWeight: '500' }}>Demo:</div>
        {
          demoText &&
          <textarea
            className='mt-2'
            style={{ width: '100%', whiteSpace: "pre-line" }}
            rows={6}
            value={`<script type="application/ld+json">\n${demoText}\n</script>`}
            disabled
          />
        }
      </div>
      <EditJSONDataModal visible={visible} setVisible={setVisible} selectedRowData={selectedRowData} getAllJSONData={getAllJSONData} />
    </div>
  )
}

export default JSONAll;
