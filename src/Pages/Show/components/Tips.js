import React, {useState, useCallback} from 'react'
import {Icon} from 'antd'
import styles from './Tips.less'

const Tips = React.memo(() => {
    const [collapsed, setCollapse] = useState(true)

    const collapse = useCallback(() => {
        setCollapse(collapsed => !collapsed)
    }, [])

    return (
        <div
            className={styles.tip}
            style={{
                right: collapsed ? -165 : 10,
                marginRight: collapsed ? 10 : 0
            }}>
            <Icon
                type={collapsed ? 'double-left' : 'double-right'}
                onClick={collapse}
            />
            <div
                className={styles.tipBody}
                style={{opacity: collapsed ? 0 : 1}}>
                <span>左键拖动旋转模型</span>
                <span>左键+shift 拖动移动模型</span>
                <span>鼠标滚轮缩放模型</span>
                <span>右键点击模型添加传感器</span>
                <span>右键点击传感器进行传感器相关操作</span>
            </div>
        </div>
    )
})

export default Tips
