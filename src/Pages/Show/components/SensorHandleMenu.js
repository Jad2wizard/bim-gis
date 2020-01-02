import React from 'react'
import {SENSOR_MENU_LIST} from './../../../utils'
import styles from './SensorHandleMenu.less'

const SensorMenu = React.memo(({top, left, onClick}) => {
    return (
        <div className={styles.sensor} style={{top, left}}>
            {SENSOR_MENU_LIST.map(s => (
                <span
                    key={s.key}
                    onClick={e => {
                        e.stopPropagation()
                        onClick(s.key)
                    }}>
                    {s.text}
                </span>
            ))}
        </div>
    )
})
export default SensorMenu
