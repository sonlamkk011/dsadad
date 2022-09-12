import { Button, Result } from 'antd'
import React from 'react'

function NotFound() {
  return (
    <>
      <Result
        status="404"
        style={{
          height: '100%',
          background: '#fff',
        }}
        title="404 Not Found"
        subTitle="Sorry, the page you visited does not exist."
        // extra={<Button type="primary">Back Home</Button>}
      />
    </>
  )
}

export default NotFound