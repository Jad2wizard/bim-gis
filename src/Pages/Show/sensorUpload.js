import React, {useCallback, useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Modal, Form, Select, Button} from 'antd'
import styles from './sensorUpload.less'

const Option = Select.Option

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 5}
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 19}
    }
}

const SensorUpload = props => {
    const {getFieldDecorator, validateFields} = props.form
    const dispatch = useDispatch()
    const deviceCodes = useSelector(state => state.modelState.deviceCodes)
    const sensorTypes = useSelector(state => state.modelState.sensorTypes)

    const [type, setType] = useState('')
    const [deviceCode, setDeviceCode] = useState('')

    const handleSubmit = useCallback(() => {
        validateFields((err, values) => {
            if (!err) {
                console.log(values)
                props.onSave(values)
            }
        })
    }, [dispatch])

    const handleTypeChange = useCallback(type => {
        setType(type)
    }, [])

    const handleDeviceCodeChange = useCallback(code => {
        setDeviceCode(code)
    }, [])

    return (
        <Form {...formItemLayout}>
            <Form.Item key="type" label="传感器类型">
                {getFieldDecorator('type', {
                    rules: [{required: true, message: '传感器类型不能为空'}]
                })(
                    <Select value={type} onChange={handleTypeChange}>
                        {sensorTypes.map(s => (
                            <Option key={s.id} value={s.id}>
                                {s.name}
                            </Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
            <Form.Item key="deviceCode" label="设备编号">
                {getFieldDecorator('deviceCode')(
                    <Select
                        showSearch
                        value={deviceCode}
                        onChange={handleDeviceCodeChange}>
                        {deviceCodes.map(code => (
                            <Option key={code} value={code}>
                                {code}
                            </Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
            <Form.Item key="submit" wrapperCol={{span: 19, offset: 5}}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                    <Button type="primary" onClick={handleSubmit}>
                        提交
                    </Button>
                </div>
            </Form.Item>
        </Form>
    )
}

const AddForm = Form.create({name: 'sensor_upload'})(SensorUpload)

export default React.memo(({onCancel}) => {
    return (
        <Modal
            wrapClassName={styles.container}
            title="添加传感器"
            visible={true}
            width={400}
            footer={null}
            maskClosable={false}
            onCancel={onCancel}>
            <AddForm />
        </Modal>
    )
})
