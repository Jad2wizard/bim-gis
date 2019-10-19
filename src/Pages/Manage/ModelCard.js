import React from 'react'
import {Tooltip, Row, Col, Icon} from 'antd'
import moment from 'moment'
import styles from './ModelCard.less'

const ModelCard = React.memo(({model, onSelect, onDelete}) => {
	const {name, image, createTime, updateTime} = model

	return (
		<div className={styles.container} onClick={() => onSelect(model.id)}>
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
				type="delete"
				className={styles.delete}
				onClick={e => {
					e.stopPropagation()
					onDelete(model.id)
				}}
			/>
		</div>
	)
})

export default ModelCard
