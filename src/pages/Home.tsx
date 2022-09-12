import { PageContainer } from '@ant-design/pro-components'
import { Avatar, Button, Descriptions, Space, Statistic } from 'antd'
import { LikeOutlined, UserOutlined } from '@ant-design/icons'
import React from 'react'

const content = (
  <Descriptions size="small" column={2}>
      <Descriptions.Item label="Creator">Pindias</Descriptions.Item>
      <Descriptions.Item label="Contact information">
          <a>0981041041</a>
      </Descriptions.Item>
      <Descriptions.Item label="Created at">2017-01-10</Descriptions.Item>
      <Descriptions.Item label="Updated at">2017-10-10</Descriptions.Item>
      <Descriptions.Item label="Address">Lô CX01, Văn Khê, Khu đô thị Văn Khê, Hà Đông, Hà Nội</Descriptions.Item>
  </Descriptions>
)

function Home() {
  return (
    <PageContainer
      content={content}
      // tabList={[
      //   {
      //     tab: 'Basic Information',
      //     key: 'base',
      //   },
      //   {
      //     tab: 'Detail Information',
      //     key: 'info',
      //   },
      // ]}
      extraContent={
        <Space size={24}>
          <Statistic
            title="Feedback"
            value={1128}
            prefix={<LikeOutlined />}
          />
          <Statistic title="Unmerged" value={93} suffix="/ 100" />
        </Space>
      }
      // extra={[
      //   <Button key="3">Action</Button>,
      //   <Button key="2">Action</Button>,
      //   <Button key="1" type="primary">
      //     Main Operation
      //   </Button>,
      // ]}
      // footer={[
      //   <Button key="3">Reset</Button>,
      //   <Button key="2" type="primary">
      //     Submit
      //   </Button>,
      // ]}
    >
    </PageContainer>
  )
}

export default Home