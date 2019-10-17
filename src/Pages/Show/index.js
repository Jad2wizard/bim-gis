import React, {useEffect, useState, useCallback, useRef} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import elementResizeEvent from 'element-resize-event'
import {getModel} from './../Manage/actions'
import styles from './index.less'

window.THREE = THREE
const ObjLoader = new OBJLoader()
const MtlLoader = new MTLLoader()
const defaultModelColor = '#888'
const zeroPoint = new THREE.Vector3(0, 0, 0)

const loadObj = url =>
	new Promise((resolve, reject) => {
		ObjLoader.load(url, obj => resolve(obj), () => {}, err => reject(err))
	})

const loadMtl = url =>
	new Promise((resolve, reject) => {
		MtlLoader.load(url, mtl => resolve(mtl), () => {}, err => reject(err))
	})

const delay = timeout =>
	new Promise(res => {
		setTimeout(res, timeout)
	})

const Show = React.memo(() => {
	const dispatch = useDispatch()

	const [model, setModel] = useState(null)
	const modelId = location.search.split('id=')[1]
	const modelList = useSelector(state => state.manageState.modelList)

	useEffect(() => {
		if (!modelId) return
		const model = modelList.find(m => m.id === modelId)
		if (!model) {
			dispatch(getModel('request', {id: modelId}))
		} else {
			setModel(model)
		}
	}, [modelList])

	const [container, setContainer] = useState(null)

	const renderer = useRef(null)
	const scene = useRef(null)
	const camera = useRef(null)
	const control = useRef(null)
	const center = useRef(zeroPoint)
	const radius = useRef(0)
	const pointLight = useRef(null)
	const object = useRef(null)

	const containerRef = useCallback(node => {
		if (node) setContainer(node)
	}, [])

	useEffect(() => {
		async function init() {
			if (!container || !model) return

			const {clientWidth, clientHeight} = container

			scene.current = new THREE.Scene()

			camera.current = new THREE.PerspectiveCamera(
				45,
				clientWidth / clientHeight,
				1,
				200000
			)

			window.scene = scene.current
			window.camera = camera.current

			renderer.current = new THREE.WebGLRenderer({
				antialias: true
			})
			renderer.current.setClearColor(0xffffff, 1.0)
			renderer.current.setPixelRatio(window.devicePixelRatio)
			renderer.current.setSize(clientWidth, clientHeight)
			renderer.current.autoClear = true

			container.appendChild(renderer.current.domElement)

			elementResizeEvent(container, handleResize)

			animate()

			if (model.mtlFile) {
				const material = await loadMtl(model.mtlFile)
				material.preload()
				ObjLoader.setMaterials(material)
			}

			const modelObj = await loadObj(model.objFile)
			for (let c of modelObj.children) {
				const {r, g, b} = c.material.color
				if (r + g + b === 0) {
					c.material.color = new THREE.Color(defaultModelColor)
				}
			}

			scene.current.add(modelObj)

			window.object = modelObj
			object.current = modelObj

			calcObjCenter(modelObj)
			initLight()
		}

		init()
	}, [container, model])

	const initLight = useCallback(() => {
		const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
		scene.current.add(ambientLight)

		pointLight.current = new THREE.PointLight(0xffffff, 0.8)
		camera.current.add(pointLight.current)
		scene.current.add(camera.current)

		const dLight = new THREE.DirectionalLight('#fff')
		dLight.target = object.current
		dLight.position.set(1, 1, 1)
		// scene.current.add(dLight)
	}, [])

	const handleResize = useCallback(() => {
		const {clientWidth, clientHeight} = container

		camera.current.aspect = clientWidth / clientHeight
		camera.current.updateProjectionMatrix()

		renderer.current.setSize(clientWidth, clientHeight)
	}, [container])

	const animate = useCallback(() => {
		requestAnimationFrame(animate)
		render()
	}, [])

	const render = useCallback(() => {
		camera.current.lookAt(center.current)
		if (control.current) control.current.update()
		renderer.current.render(scene.current, camera.current)
	}, [])

	const calcObjCenter = useCallback(async object => {
		const newCenter = new THREE.Vector3(0, 0, 0)
		let newRadius = 0
		for (let child of object.children) {
			let boundingSphere = child.geometry.boundingSphere
			while (!boundingSphere) {
				await delay(200)
				boundingSphere = child.geometry.boundingSphere
			}
			const {x, y, z} = boundingSphere.center
			newCenter.x += x
			newCenter.y += y
			newCenter.z += z
			const temp = Math.max(x, y, z)
			if (temp > newRadius) newRadius = temp
		}
		const meshNum = object.children.length
		if (meshNum > 0) {
			newCenter.x = newCenter.x / meshNum
			newCenter.y = newCenter.y / meshNum
			newCenter.z = newCenter.z / meshNum
		}

		center.current = newCenter
		radius.current = newRadius

		control.current = new OrbitControls(
			camera.current,
			renderer.current.domElement,
			newCenter
		)

		camera.current.position.x = (1.6 * newRadius) / 1.73205
		camera.current.position.y = (2.0 * newRadius) / 1.73205 //除以根号3
		camera.current.position.z = (1.6 * newRadius) / 1.73205

		pointLight.current.position.x = 1 * newRadius
		pointLight.current.position.y = 1 * newRadius
		pointLight.current.position.z = 1 * newRadius
	}, [])

	return <div ref={containerRef} className={styles.container}></div>
})

export default Show
