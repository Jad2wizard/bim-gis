import React, {useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Icon, Form, Input, Radio, Upload, Button, Modal} from 'antd'
import {addModel} from './actions'
import styles from './Upload.less'

const formItemLayout = {
	labelCol: {
		xs: {span: 24},
		sm: {span: 5}
	},
	wrapperCol: {
		xs: {span: 24},
		sm: {span: 12}
	}
}
const ModelUpload = props => {
	const {getFieldDecorator, setFieldsValue, validateFields} = props.form
	const dispatch = useDispatch()
	const [type, setType] = useState('obj')

	useEffect(() => {
		setFieldsValue({
			type
		})
	}, [])

	const handleSubmit = useCallback(() => {
		validateFields((err, values) => {
			if (!err) {
				console.log(values)
				const image = values.image[0]
				const mtlFile = values.mtlFile[0]
				const objFile = values.objFile[0]
				dispatch(
					addModel('request', {
						model: {
							...values,
							image: image ? image.originFileObj : null,
							mtlFile: mtlFile ? mtlFile.originFileObj : null,
							objFile: objFile ? objFile.originFileObj : null
						}
					})
				)
			}
		})
	}, [])

	return (
		<Form {...formItemLayout}>
			<Form.Item label="模型名称">
				{getFieldDecorator('name', {
					rules: [
						{required: true, message: '模型名称不能为空'},
						{max: 20, message: '模型名称过长'}
					]
				})(<Input />)}
			</Form.Item>
			<Form.Item label="模型类型">
				{getFieldDecorator('type')(
					<Radio.Group onChange={e => setType(e.target.value)}>
						<Radio value="obj">obj</Radio>
						<Radio value="fbx">fbx</Radio>
						<Radio value="stl">stl</Radio>
					</Radio.Group>
				)}
			</Form.Item>
			<Form.Item label="模型描述">
				{getFieldDecorator('desc', {
					rules: [{max: 80, message: '模型描述过长'}]
				})(
					<Input.TextArea
						autosize={{minRows: 5, maxRows: 5}}></Input.TextArea>
				)}
			</Form.Item>
			<Form.Item label="模型缩略图">
				{getFieldDecorator('image', {
					initialValue: [],
					valuePropName: 'fileList',
					getValueFromEvent: e => e.fileList
				})(
					<Upload onRemove={() => setFieldsValue({image: []})}>
						<Button>
							<Icon type="upload" /> 点击上传
						</Button>
					</Upload>
				)}
			</Form.Item>
			{type === 'obj' && (
				<Form.Item label="MTL 文件">
					{getFieldDecorator('mtlFile', {
						initialValue: [],
						valuePropName: 'fileList',
						getValueFromEvent: e => e.fileList
					})(
						<Upload
							accept=".mtl"
							onRemove={() => setFieldsValue({mtlFile: []})}>
							<Button>
								<Icon type="upload" /> 点击上传
							</Button>
						</Upload>
					)}
				</Form.Item>
			)}
			{type === 'obj' && (
				<Form.Item label="OBJ 文件">
					{getFieldDecorator('objFile', {
						rules: [{required: true, message: 'OBJ 文件不能为空'}],
						initialValue: [],
						valuePropName: 'fileList',
						getValueFromEvent: e => e.fileList
					})(
						<Upload
							accept=".obj"
							onRemove={() => setFieldsValue({objFile: []})}>
							<Button>
								<Icon type="upload" /> 点击上传
							</Button>
						</Upload>
					)}
				</Form.Item>
			)}
			<Form.Item wrapperCol={{span: 12, offset: 5}}>
				<Button type="primary" onClick={handleSubmit}>
					提交
				</Button>
			</Form.Item>
		</Form>
	)
}

const AddForm = Form.create({name: 'model_upload'})(ModelUpload)

export default React.memo(({onCancel}) => {
	return (
		<Modal
			wrapClassName={styles.container}
			title="添加模型"
			visible={true}
			width={500}
			footer={null}
			maskClosable={false}
			onCancel={onCancel}>
			<AddForm />
		</Modal>
	)
})
