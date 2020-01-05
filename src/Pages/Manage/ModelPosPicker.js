import React, {useRef, useEffect, useState, useCallback} from 'react'
import {Modal} from 'antd'
import BaiduMap from './../../utils/map'
import {defaultCenter} from './../../utils'
import styles from './ModelPosPicker.less'

const Map = React.memo(({point = null, onSave, onCancel}) => {
    const [container, setContainer] = useState(null)
    const mapRef = useRef(null)
    const markerRef = useRef(point ? new BaiduMap.Marker(point) : null)

    const ref = useCallback(node => {
        if (node) setContainer(node)
    }, [])

    const handleSave = useCallback(() => {
        if (markerRef) onSave(markerRef.current.getPosition())
    }, [])

    //init baidu map
    useEffect(() => {
        if (container) {
            const map = new BaiduMap.Map('model-pos-picker', {
                enableMapClick: false
            })

            let center = [...defaultCenter]
            if (markerRef.current) {
                const {lng, lat} = markerRef.current.getPosition()
                center[0] = lng
                center[1] = lat
            }
            map.centerAndZoom(new BaiduMap.Point(...center), 8)
            map.enableScrollWheelZoom(true)
            map.disableDoubleClickZoom()
            map.addEventListener('click', e => {
                e.domEvent.stopPropagation()
                if (markerRef.current) map.removeOverlay(markerRef.current)
                const marker = new BaiduMap.Marker(e.point)
                marker.enableDragging()
                markerRef.current = marker
                map.addOverlay(marker)
            })
            map.addEventListener('mouseup', e => {
                e.domEvent.stopPropagation()
            })

            if (markerRef.current) {
                markerRef.current.enableDragging()
                map.addOverlay(markerRef.current)
            }
            mapRef.current = map
            window.map = map
        }
    }, [container])

    return (
        <Modal
            width={700}
            visible={true}
            onOk={handleSave}
            onCancel={onCancel}
            okText="保存"
            wrapClassName={styles.mapModal}>
            <div className={styles.map} id="model-pos-picker" ref={ref}></div>
        </Modal>
    )
})

export default Map
