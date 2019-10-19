import React, {useEffect, useState, useCallback, useRef} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import elementResizeEvent from 'element-resize-event'
import {getModel} from './../Manage/actions'
import styles from './index.less'

window.THREE = THREE
const ObjLoader = new OBJLoader()
const MtlLoader = new MTLLoader()
const StlLoader = new STLLoader()
const FbxLoader = new FBXLoader()
const defaultModelColor = '#333'
const zeroPoint = new THREE.Vector3(0, 0, 0)
const boundingBox = new THREE.Box3()

const loadObj = url =>
	new Promise((resolve, reject) => {
		ObjLoader.load(url, obj => resolve(obj), () => {}, err => reject(err))
	})

const loadMtl = url =>
	new Promise((resolve, reject) => {
		MtlLoader.load(url, mtl => resolve(mtl), () => {}, err => reject(err))
	})

const loadStl = url =>
	new Promise((resolve, reject) => {
		StlLoader.load(
			url,
			geometry => {
				resolve(geometry)
			},
			() => {},
			err => reject(err)
		)
	})

const loadFbx = url =>
	new Promise((resolve, reject) => {
		FbxLoader.load(
			url,
			object => {
				resolve(object)
			},
			() => {},
			err => reject(err)
		)
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
	const mixers = useRef([])
	const clock = useRef(null)

	const containerRef = useCallback(node => {
		if (node) setContainer(node)
	}, [])

	useEffect(() => {
		async function init() {
			if (!container || !model) return

			const {clientWidth, clientHeight} = container

			clock.current = new THREE.Clock()

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

			await loadModel(model)

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

		if (object.current) {
			const dLight = new THREE.DirectionalLight('#fff')
			dLight.target = object.current
			dLight.position.set(1, 1, 1)
			scene.current.add(dLight)
		}
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
		if (mixers.current.length > 0) {
			for (let i = 0; i < mixers.current.length; i++) {
				mixers[i].update(clock.current.getDelta())
			}
		}

		camera.current.lookAt(center.current)
		if (control.current) control.current.update()
		renderer.current.render(scene.current, camera.current)
	}, [])

	const loadModel = useCallback(model => {
		const asyncFunc = async model => {
			let modelMesh = null
			switch (model.type) {
				case 'obj': {
					if (model.mtlFile) {
						const material = await loadMtl(model.mtlFile)
						material.preload()
						ObjLoader.setMaterials(material)
					}

					const modelObj = await loadObj(model.objFile)
					for (let c of modelObj.children) {
						if (!c.material.color) continue
						const {r, g, b} = c.material.color
						if (r + g + b === 0) {
							c.material.color = new THREE.Color(
								defaultModelColor
							)
						}
					}
					modelMesh = modelObj
					break
				}
				case 'stl': {
					const stlGeo = await loadStl(model.stlFile)
					const stlMesh = new THREE.Mesh(
						stlGeo,
						new THREE.MeshPhongMaterial({
							color: 0x999999,
							specular: 0x111111,
							shininess: 200
						})
					)
					modelMesh = stlMesh
					break
				}
				case 'fbx': {
					const fbxMesh = await loadFbx(model.fbxFile)
					// if(fbxMesh.animations) mixers.current.push(fbxMesh.animations)
					//
					// const action = fbxMesh.animations.clipAction( fbxMesh.animations[ 0 ] );
					// action.play();

					for (let c of fbxMesh.children) {
						if (!c.material || !c.material.color) continue
						c.material.color = new THREE.Color(defaultModelColor)
					}
					modelMesh = fbxMesh
					break
				}
				default:
					break
			}
			if (modelMesh) {
				scene.current.add(modelMesh)

				boundingBox.expandByObject(modelMesh)
				const {min, max} = boundingBox

				center.current = new THREE.Vector3(
					(max.x - min.x) / 2 + min.x,
					(max.y - min.y) / 2 + min.y,
					(max.z - min.z) / 2 + min.z
				)

				radius.current = Math.max(
					max.x - min.x,
					max.y - min.y,
					max.z - min.z
				)

				control.current = new OrbitControls(
					camera.current,
					renderer.current.domElement,
					center.current
				)

				camera.current.position.x = (1 * radius.current) / 1.73205
				camera.current.position.y = (1.2 * radius.current) / 1.73205 //除以根号3
				camera.current.position.z = (1 * radius.current) / 1.73205

				pointLight.current.position.x = 1 * radius.current
				pointLight.current.position.y = 1 * radius.current
				pointLight.current.position.z = 1 * radius.current
			}

			window.object = modelMesh
			object.current = modelMesh
		}

		asyncFunc(model)
	}, [])

	return <div ref={containerRef} className={styles.container}></div>
})

export default Show
