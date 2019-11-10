import React, {useRef, useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Tooltip, Icon, Form, Input, Radio, Upload, Button, Modal} from 'antd'
import ModelPosPicker from './ModelPosPicker'
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
		sm: {span: 19}
	}
}

const ModelUpload = props => {
	const {getFieldDecorator, setFieldsValue, validateFields} = props.form
	const dispatch = useDispatch()
	const [type, setType] = useState('obj')
	const [mapVisible, setMapVisible] = useState(false)
	const positionRef = useRef({lng: 0, lat: 0})

	useEffect(() => {
		setFieldsValue({
			type
		})
	}, [])

	const handlePosChange = useCallback(pos => {
		positionRef.current.lng = pos.lng
		positionRef.current.lat = pos.lat
		setMapVisible(false)
	}, [])

	const handleHiddenPosPicker = useCallback(() => {
		setMapVisible(false)
	}, [])

	const handleSubmit = useCallback(() => {
		validateFields((err, values) => {
			if (!err) {
				const image = values.image[0]
				const files = {}
				for (let ft of MODEL_TYPE_FILE_MAP[type]) {
					const uploadFile = values[ft.key][0]
					if (uploadFile) files[ft.key] = uploadFile.originFileObj
					else delete values[ft.key]
				}

				dispatch(
					addModel('request', {
						model: {
							...values,
							image: image ? image.originFileObj : null,
							...files,
							...positionRef.current
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
							getValueFromEvent: e =>
								e.fileList.length === 0
									? []
									: [e.fileList[e.fileList.length - 1]]
						})(
							<Upload
								accept={`.${item.id}`}
								onRemove={() =>
									setFieldsValue({[item.key]: []})
								}>
								<Tooltip title={item.tip || null}>
									<Button>
										<Icon type="upload" /> 点击上传
									</Button>
								</Tooltip>
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

			<Form.Item key="submit" wrapperCol={{span: 19, offset: 5}}>
				<div
					style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						justifyContent: 'space-between'
					}}>
					<Button onClick={() => setMapVisible(true)}>
						选择模型位置
					</Button>
					<Button type="primary" onClick={handleSubmit}>
						提交
					</Button>
				</div>
			</Form.Item>
			{mapVisible && (
				<ModelPosPicker
					onSave={handlePosChange}
					onCancel={handleHiddenPosPicker}
				/>
			)}
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
