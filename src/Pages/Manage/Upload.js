import React, {useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Icon, Form, Input, Radio, Upload, Button, Modal} from 'antd'
import {addModel} from './actions'
import {MODEL_TYPE_FILE_MAP} from './../../utils'
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
				const image = values.image[0]
				const files = {}
				for (let ft of MODEL_TYPE_FILE_MAP[type]) {
					const uploadFile = values[ft.key][0]
					if (uploadFile) files[ft.key] = uploadFile.originFileObj
				}

				dispatch(
					addModel('request', {
						model: {
							...values,
							image: image ? image.originFileObj : null,
							...files
						}
					})
				)
			}
		})
	}, [type])

	const renderFileUpload = useCallback(type => {
		const fileTypeList = MODEL_TYPE_FILE_MAP[type]
		return (
			<React.Fragment>
				{fileTypeList.map(item => (
					<Form.Item key={item.id} label={item.label}>
						{getFieldDecorator(item.key, {
							rules: item.rules,
							initialValue: [],
							valuePropName: 'fileList',
							getValueFromEvent: e => e.fileList
						})(
							<Upload
								accept={`.${item.id}`}
								onRemove={() =>
									setFieldsValue({[item.key]: []})
								}>
								<Button>
									<Icon type="upload" /> 点击上传
								</Button>
							</Upload>
						)}
					</Form.Item>
				))}
			</React.Fragment>
		)
	}, [])

	return (
		<Form {...formItemLayout}>
			<Form.Item key="name" label="模型名称">
				{getFieldDecorator('name', {
					rules: [
						{required: true, message: '模型名称不能为空'},
						{max: 20, message: '模型名称过长'}
					]
				})(<Input />)}
			</Form.Item>
			<Form.Item key="type" label="模型类型">
				{getFieldDecorator('type')(
					<Radio.Group onChange={e => setType(e.target.value)}>
						{Object.keys(MODEL_TYPE_FILE_MAP).map(t => (
							<Radio key={t} value={t}>
								{t}
							</Radio>
						))}
					</Radio.Group>
				)}
			</Form.Item>
			<Form.Item key="desc" label="模型描述">
				{getFieldDecorator('desc', {
					rules: [{max: 80, message: '模型描述过长'}]
				})(
					<Input.TextArea
						autosize={{minRows: 3, maxRows: 3}}></Input.TextArea>
				)}
			</Form.Item>
			<Form.Item key="image" label="模型缩略图">
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
			{renderFileUpload(type)}
			<Form.Item key="submit" wrapperCol={{span: 12, offset: 5}}>
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
