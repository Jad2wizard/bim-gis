import React, {useState, useCallback, useMemo} from 'react'
import {useDispatch} from 'react-redux'
import {Tooltip, Row, Col, Icon} from 'antd'
import moment from 'moment'
import {updateModel} from './actions'
import ModelPosPicker from './ModelPosPicker'
import styles from './ModelCard.less'

const ModelCard = React.memo(({model, onSelect, onDelete}) => {
	const {name, image, createTime, updateTime} = model
	const [pickerVisible, setPickerVisible] = useState(false)
	const dispatch = useDispatch()

	const handlePosChange = useCallback(
		pos => {
			const {lng, lat} = pos

			dispatch(
				updateModel('request', {
					params: {
						id: model.id,
						lng,
						lat
					}
				})
			)

			setPickerVisible(false)
		},
		[model]
	)

	const handleHiddenPosPicker = useCallback(() => {
		setPickerVisible(false)
	}, [])

	const point = useMemo(
		() => ({
			lng: model.lng,
			lat: model.lat
		}),
		[model]
	)

	return (
		<div
			className={styles.container}
			onClick={e => {
				const path = e.nativeEvent.path
				if (
					path.some(
						p =>
							p.className &&
							p.className.includes(styles.container)
					)
				)
					onSelect(model.id)
			}}>
			<Tooltip title={model.desc || ''}>
				<img src={image || '/img/timg.c98df3e.jpg'} />
			</Tooltip>
			<div className={styles.body}>
				<Row key="name">
					<Col key="title" span={8}>
						模型名称：
					</Col>
					<Col key="value" span={16}>
						{name}
					</Col>
				</Row>
				<Row key="createTime">
					<Col key="title" span={8}>
						创建时间：
					</Col>
					<Col key="value" span={16}>
						{moment(createTime).format('YYYY-MM-DD HH:mm:ss')}
					</Col>
				</Row>
				<Row key="updateTime">
					<Col key="title" span={8}>
						更新时间：
					</Col>
					<Col key="value" span={16}>
						{moment(updateTime).format('YYYY-MM-DD HH:mm:ss')}
					</Col>
				</Row>
			</div>
			<Icon
				type="environment"
				className={styles.update}
				onClick={e => {
					e.stopPropagation()
					setPickerVisible(true)
				}}
			/>
			<Icon
				type="delete"
				className={styles.delete}
				onClick={e => {
					e.stopPropagation()
					onDelete(model.id)
				}}
			/>
			{pickerVisible && (
				<ModelPosPicker
					point={point}
					onSave={handlePosChange}
					onCancel={handleHiddenPosPicker}
				/>
			)}
		</div>
	)
})

export default ModelCard
