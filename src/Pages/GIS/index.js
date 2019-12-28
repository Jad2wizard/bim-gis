import React, {useState, useRef, useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {routerActions} from 'react-router-redux'
import moment from 'moment'
import BaiduMap from './../../utils/map'
import {defaultCenter, defaultModelImg} from './../../utils'
import styles from './index.less'

const infoWindow = BaiduMap ? new BaiduMap.InfoWindow() : null
const GIS = React.memo(() => {
    const dispatch = useDispatch()
    const [container, setContainer] = useState(null)
    const modelList = useSelector(state => state.manageState.modelList)
    const mapRef = useRef(null)

    const ref = useCallback(node => {
        if (node) setContainer(node)
    }, [])

    //init baidu map
    useEffect(() => {
        if (container && !mapRef.current) {
            const map = new BaiduMap.Map('gis-map', {
                enableMapClick: false
            })

            map.enableScrollWheelZoom(true)
            map.disableDoubleClickZoom()

            map.addEventListener('mouseup', e => {
                e.domEvent.stopPropagation()
                if (e.overlay && e.overlay.id)
                    dispatch(routerActions.push(`/show?id=${e.overlay.id}`))
            })

            mapRef.current = map
            window.map = map
        }
    }, [container])

    //render model in map
    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current
            const existMarkers = map.getOverlays()
            const toDeInsertModel = modelList.filter(
                m => !existMarkers.find(em => em.id === m.id)
            )
            for (let mark of existMarkers) {
                if (!modelList.find(m => m.id === mark.id))
                    map.removeOverlay(mark)
            }
            for (let m of toDeInsertModel) {
                const point = new BaiduMap.Point(m.lng, m.lat)
                const marker = new BaiduMap.Marker(point)
                marker.id = m.id
                map.addOverlay(marker)

                marker.addEventListener('mouseover', () => {
                    infoWindow.setWidth(300)
                    infoWindow.setHeight(400)
                    infoWindow.setTitle(m.name)
                    let content = `模型类型: ${m.type}`
                    if (m.type) {
                        content += '<br/>'
                        content += `模型描述: ${m.desc}`
                    }
                    content += '<br/>'
                    content += `创建时间: ${moment(m.createTime).format(
                        'YYYY-MM-DD HH:mm:ss'
                    )}`
                    content += '<br/>'
                    content += `最近更新: ${moment(m.updateTime).format(
                        'YYYY-MM-DD HH:mm:ss'
                    )}`
                    content += `<img width="300" height="300" src="${m.image ||
                        defaultModelImg}"/>`
                    infoWindow.setContent(content)
                    map.openInfoWindow(infoWindow, point)
                })
            }

            const points = map.getOverlays().map(m => m.getPosition())
            if (points.length > 0) {
                map.setViewport(points, {
                    delay: 0
                })

                let center = defaultCenter
                let lngSum = 0
                let latSum = 0
                for (let m of points) {
                    lngSum += m.lng
                    latSum += m.lat
                }
                if (modelList.length > 0) {
                    center[0] = lngSum / modelList.length
                    center[1] = latSum / modelList.length
                }
                const centerPoint = new BaiduMap.Point(...center)
                map.setCenter(centerPoint)
            }
        }
    }, [container, modelList])

    return (
        <div id="gis-map" ref={ref} className={styles.container}>
            地图
        </div>
    )
})

export default GIS
