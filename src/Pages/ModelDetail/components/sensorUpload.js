import React, {useCallback, useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Modal, Form, Select, Button} from 'antd'
import styles from './sensorUpload.less'
import PropTypes from 'prop-types'

const Option = Select.Option

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 8}
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 16}
    }
}

const SensorUpload = ({onSave, form}) => {
    const {getFieldDecorator, validateFields} = form
    const deviceCodes = useSelector(state => state.modelState.deviceCodes)
    const sensorTypes = useSelector(state => state.modelState.sensorTypes)

    const handleSubmit = useCallback(() => {
        validateFields((err, values) => {
            if (!err) {
                onSave(values)
            }
        })
    }, [onSave, validateFields])

    return (
        <Form {...formItemLayout}>
            <Form.Item key="type" label="传感器类型">
                {getFieldDecorator('type', {
                    rules: [{required: true, message: '传感器类型不能为空'}]
                })(
                    <Select>
                        {sensorTypes.map(s => (
                            <Option key={s.name} value={s.name}>
                                {s.name}
                            </Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
            <Form.Item key="deviceCode" label="设备编号">
                {getFieldDecorator('deviceCode', {
                    rules: [{required: true, message: '传感器类型不能为空'}]
                })(
                    <Select showSearch>
                        {deviceCodes.map(code => (
                            <Option key={code} value={code}>
                                {code}
                            </Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
            <Form.Item key="submit" wrapperCol={{span: 19, offset: 8}}>
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

SensorUpload.propTypes = {
    onSave: PropTypes.func.isRequired
}

const AddForm = Form.create({name: 'sensor_upload'})(SensorUpload)

export default React.memo(({onSave, onCancel}) => {
    return (
        <Modal
            wrapClassName={styles.container}
            title="添加传感器"
            visible={true}
            width={400}
            footer={null}
            maskClosable={false}
            onCancel={onCancel}>
            <AddForm onSave={onSave} />
        </Modal>
    )
})
