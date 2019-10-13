import React from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'
import styles from './ModelCard.less'

const ModelCard = React.memo(({ model, onClick }) => {
    const { name, image, createTime, updateTime } = model

    return (
        <div className={styles.container} onClick={() => onClick(model.id)}>
            <img src={image || '/img/timg.c98df3e.jpg'} />
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
        </div>
    )
})

export default ModelCard