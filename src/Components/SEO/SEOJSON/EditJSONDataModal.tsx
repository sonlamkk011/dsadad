import { Form, Input, message, Modal, Select, Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react'
import { fetchEditJSONData } from '../../../service/SEO/JSONLD';

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const { Text } = Typography;
const { Option } = Select;

function EditJSONDataModal(prop: any) {
    const { visible, setVisible, getAllJSONData, selectedRowData } = prop;
    const [isRowDataActive, setisRowDataActive] = useState(false);
    const [modalLoading, setmodalLoading] = useState(false);

    const [form] = Form.useForm();

    const children: React.ReactNode[] = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach((day: any) => {
        children.push(<Option key={day}>{day}</Option>);
    })

    useEffect(() => {
        if (selectedRowData) {
            const parsedAddress = JSON.parse(selectedRowData.address)
            const parsedGeo = JSON.parse(selectedRowData.geo)
            const parsedOpeningHours = JSON.parse(selectedRowData.openingHoursSpecification)
            form.setFieldsValue({
                id: selectedRowData.id,
                image: selectedRowData.image,
                name: selectedRowData.name,
                addressLocality: parsedAddress.addressLocality,
                postalCode: parsedAddress.postalCode,
                streetAddress: parsedAddress.streetAddress,
                context: selectedRowData.context,
                latitude: parsedGeo.latitude,
                longitude: parsedGeo.longitude,
                opens: parsedOpeningHours.opens,
                closes: parsedOpeningHours.closes,
                dayOfWeek: parsedOpeningHours.dayOfWeek,
                priceRange: selectedRowData.priceRange,
                type: selectedRowData.type,
                url: selectedRowData.url,
                active: selectedRowData.active,
            });
            setisRowDataActive(selectedRowData.active)
        }
    }, [selectedRowData]);

    const handleOk = () => {
        setmodalLoading(true);
        form
            .validateFields()
            .then(async values => {
                const formattedData = formatData(values);
                const response = await fetchEditJSONData(formattedData, setmodalLoading)
                if (response) {
                    if (response.status === 200) {
                        message.success('Edit JSON data success');
                        setVisible(false);
                        getAllJSONData();
                    } else {
                        message.error(response.data)
                    }
                } else {
                    message.error('Edit JSON data failed')
                }
            })
            .catch(errorInfo => {
                const { errorFields } = errorInfo;
                const errorFieldsNameArray: any = []
                errorFields.forEach((field: any) => {
                    const capitalizedFieldName = field.name[0].charAt(0).toUpperCase() + field.name[0].slice(1)
                    errorFieldsNameArray.push(capitalizedFieldName)
                })
                message.destroy();
                message.error(`${errorFieldsNameArray.join(", ")} is invalid`);
            });
    };

    const formatData = (data: any) => {
        const address = JSON.stringify({
            addressCountry: "VN",
            addressLocality: data.addressLocality,
            postalCode: data.postalCode,
            streetAddress: data.streetAddress,
            type: "PostalAddress"
        })
        const geo = JSON.stringify({
            latitude: data.latitude,
            longitude: data.longitude,
            type: "GeoCoordinates"
        })
        const openingHoursSpecification = JSON.stringify({
            closes: data.closes,
            dayOfWeek: data.dayOfWeek,
            opens: data.opens,
            type: "OpeningHoursSpecification"
        })
        const formattedData = {
            active: data.active,
            address,
            context: data.context,
            geo,
            id: data.id,
            image: data.image,
            name: data.name,
            openingHoursSpecification,
            priceRange: data.priceRange,
            type: data.type,
            url: data.url
        }
        return formattedData
    }

    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <>
            <Modal
                title="Edit information"
                centered
                visible={visible}
                onOk={handleOk}
                confirmLoading={modalLoading}
                onCancel={handleCancel}
                destroyOnClose
                okText="Save"
                width={800}
            >
                <Form
                    {...layout}
                    form={form}
                    name="basic"
                    autoComplete="off"
                >
                    <Form.Item
                        label="ID"
                        name="id"
                    >
                        <Text>{selectedRowData?.id}</Text>
                    </Form.Item>
                    <Form.Item
                        label="Image"
                        name="image"
                    >
                        <Input
                            placeholder="Enter new image URL"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Name"
                        name="name"
                    >
                        <Input
                            placeholder="Enter new name"
                        />
                    </Form.Item>
                    <Form.Item
                        label="City"
                        name="addressLocality"
                    >
                        <Input
                            placeholder="Enter new city"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Postal code"
                        name="postalCode"
                    >
                        <Input
                            placeholder="Enter new postal code"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Street address"
                        name="streetAddress"
                    >
                        <Input
                            placeholder="Enter new street address"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Latitude"
                        name="latitude"
                    >
                        <Input
                            placeholder="Enter new latitude"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Longitude"
                        name="longitude"
                    >
                        <Input
                            placeholder="Enter new longitude"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Context"
                        name="context"
                    >
                        <Input
                            placeholder="Enter new context"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Opening hours"
                        name="opens"
                    >
                        <Input
                            placeholder="Enter new Opening hours"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Closing hours"
                        name="closes"
                    >
                        <Input
                            placeholder="Enter new Closing hours"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Days of week"
                        name="dayOfWeek"
                    >
                        <Select
                            mode="multiple"
                            size={'middle'}
                            placeholder="Please select days of week"
                            style={{ width: '100%' }}
                        >
                            {children}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Price Range"
                        name="priceRange"
                    >
                        <Input
                            placeholder="Enter new Price Range"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Type"
                        name="type"
                    >
                        <Input
                            placeholder="Enter new type"
                        />
                    </Form.Item>
                    <Form.Item
                        label="URL"
                        name="url"
                    >
                        <Input
                            placeholder="Enter new url"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Active"
                        name="active"
                    >
                        <Switch checked={isRowDataActive} onChange={(e) => setisRowDataActive(e)} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default EditJSONDataModal