import React, {useState, useRef, useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {routerActions} from 'react-router-redux'
import BaiduMap from './../../utils/map'
import {defaultCenter} from './../../utils'
import styles from './index.less'

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
				const marker = new BaiduMap.Marker(
					new BaiduMap.Point(m.lng, m.lat)
				)
				marker.id = m.id
				marker.setLabel(
					new BaiduMap.Label(m.name, {
						offset: new BaiduMap.Size(20, -10)
					})
				)
				map.addOverlay(marker)
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
