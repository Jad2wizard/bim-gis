import React, {useEffect, useState, useCallback, useRef, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {message, Icon} from 'antd'
import moment from 'moment'
import elementResizeEvent from 'element-resize-event'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {
    CSS2DRenderer,
    CSS2DObject
} from 'three/examples/jsm/renderers/CSS2DRenderer'
import {updateModel} from './../Manage/actions'
import {fetchDeviceCodes} from './actions'
import SensorUpload from './components/sensorUpload'
import SensorHandleMenu from './components/SensorHandleMenu'
import SensorDataVis from './components/SensorDataVis'
import Tips from './components/Tips'
import styles from './index.less'
import { Model } from 'echarts/lib/export'

window.THREE = THREE
const ObjLoader = new OBJLoader()
const MtlLoader = new MTLLoader()
const StlLoader = new STLLoader()
const FbxLoader = new FBXLoader()
const defaultModelColor = '#888'
const zeroPoint = new THREE.Vector3(0, 0, 0)
const rayCaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
// const rotateDecay = 2 // Orbitcontrol rotateSpeed 随摄像机到中心点距离的衰减比例

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

const ModelDetail = React.memo(() => {
    const dispatch = useDispatch()

    const [model, setModel] = useState(null)
    const [container, setContainer] = useState(null)
    const [sensorUploadVisible, setSensorUploadVisible] = useState(false)
    const [sensorDataVisible, setSensorDataVisible] = useState(false)
    const [sensorId, setSensorId] = useState(null)

    const modelId = location.search.split('id=')[1]
    const modelList = useSelector(state => state.manageState.modelList)

    const clickPos = useRef({x: 0, y: 0})
    const intersectPoint = useRef(null)
    const renderer = useRef(null)
    const labelRendererRef = useRef(null)
    const scene = useRef(null)
    const camera = useRef(null)
    const control = useRef(null)
    const center = useRef(zeroPoint)
    const radius = useRef(0)
    const pointLight = useRef(null)
    const object = useRef(null)
    const mixers = useRef([])
    const clock = useRef(null)
    const loadingRef = useRef(null)

    useEffect(() => {
        if (modelId) {
            dispatch(fetchDeviceCodes('request', {modelId: modelId}))
        }
    }, [modelId, dispatch])

    useEffect(() => {
        if (!modelId) return
        const model = modelList.find(m => m.id === modelId)
        setModel(model)
    }, [modelList, setModel, modelId])

    const containerRef = useCallback(node => {
        if (node) setContainer(node)
    }, [])

    useEffect(() => {
        async function init() {
            if (!container || !model || scene.current) return

            if (!loadingRef.current)
                loadingRef.current = message.loading('正在加载模型', 0)

            const {clientWidth, clientHeight} = container

            clock.current = new THREE.Clock()

            scene.current = new THREE.Scene()

            const planeMesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(100000, 100000),
                new THREE.MeshLambertMaterial({
                    color: 0xdddddd,
                    depthWrite: false
                })
            )
            planeMesh.rotation.x = -Math.PI / 2
            planeMesh.receiveShadow = true
            scene.current.add(planeMesh)

            camera.current = new THREE.PerspectiveCamera(
                45,
                clientWidth / clientHeight,
                0.1,
                20000000
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

            const labelRenderer = new CSS2DRenderer()
            labelRenderer.setSize(clientWidth, clientHeight)
            labelRendererRef.current = labelRenderer

            labelRenderer.domElement.style.position = 'absolute'
            labelRenderer.domElement.style.top = 0
            container.appendChild(labelRenderer.domElement)
            renderer.current.domElement.style.position = 'absolute'
            renderer.current.domElement.style.top = 0
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
        labelRendererRef.current.setSize(clientWidth, clientHeight)
    }, [container])

    const animate = useCallback(() => {
        requestAnimationFrame(animate)
        render()
    }, [])

    const render = useCallback(() => {
        if (mixers.current.length > 0) {
            for (let i = 0; i < mixers.current.length; i++) {
                mixers.current[i].update(clock.current.getDelta())
            }
        }

        camera.current.lookAt(center.current)
        if (control.current) control.current.update()

        renderer.current.render(scene.current, camera.current)
        labelRendererRef.current.render(scene.current, camera.current)
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

                    fbxMesh.mixer = new THREE.AnimationMixer(fbxMesh)
                    mixers.current.push(fbxMesh.mixer)
                    const action = fbxMesh.mixer.clipAction(
                        fbxMesh.animations[0]
                    )
                    action.play()

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

                const boundingBox = new THREE.Box3()
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

                renderSensors(model.sensors)

                control.current = new OrbitControls(
                    camera.current,
                    renderer.current.domElement
                )
                control.current.target = center.current
                control.current.screenSpacePanning = true
                window.control = control.current

                camera.current.position.x = (1 * radius.current) / 1.73205
                camera.current.position.y = (1.2 * radius.current) / 1.73205 //除以根号3
                camera.current.position.z = (1 * radius.current) / 1.73205

                // camDistanceRef.current = camera.current.position.distanceTo(center.current)

                pointLight.current.position.x = 1 * radius.current
                pointLight.current.position.y = 1 * radius.current
                pointLight.current.position.z = 1 * radius.current
            }

            window.object = modelMesh
            object.current = modelMesh

            if (loadingRef.current) {
                loadingRef.current()
                loadingRef.current = null
            }
        }

        asyncFunc(model)
    }, [])

    const getIntersectObj = useCallback(
        e => {
            const {clientX, clientY} = e
            const {offsetWidth, offsetHeight} = container
            const x = clientX - e.target.parentElement.offsetLeft
            const y = clientY - e.target.parentElement.offsetTop
            mouse.x = (x / offsetWidth) * 2 - 1
            mouse.y = 1 - (y / offsetHeight) * 2

            rayCaster.setFromCamera(mouse, camera.current)

            const intersects = rayCaster.intersectObjects(
                scene.current.children,
                true
            )
            if (intersects.length > 0) {
                return {
                    position: {x, y},
                    intersectObj: intersects[0]
                }
            }

            return {}
        },
        [container]
    )

    const handleClick = useCallback(e => {
        if (
            e.nativeEvent.path.find(
                d => d.className && d.className.includes('ant-modal')
            )
        )
            return
        handleHideSensorMenu()
    }, [])

    const handleRightClick = useCallback(
        e => {
            const {intersectObj, position} = getIntersectObj(e)
            clickPos.current = position

            //右键点击的不是传感器，则弹出添加传感器的界面
            if (intersectObj && intersectObj.object.parent.name !== 'sensors') {
                intersectPoint.current = intersectObj.point
                setSensorUploadVisible(true)
            }
            //右键点击的是传感器，则弹出该传感器的操作栏
            if (intersectObj && intersectObj.object.parent.name === 'sensors') {
                const sensorId = intersectObj.object.name
                if (sensorId) setSensorId(sensorId)
            }
        },
        [container]
    )

    const handleSensorMenuEvent = useCallback(
        action => {
            switch (action) {
                case 'delete': {
                    handleDeleteSensor(sensorId)
                    handleHideSensorMenu()
                    break
                }
                case 'data-vis': {
                    setSensorDataVisible(true)
                    break
                }
                default:
                    break
            }
        },
        [sensorId]
    )

    const handleHideSensorData = useCallback(() => {
        setSensorId(null)
        setSensorDataVisible(false)
    }, [])

    const handleHideSensorMenu = useCallback(() => {
        setSensorId(null)
    }, [])

    const handleDeleteSensor = useCallback(
        sensorId => {
            const {sensors} = model
            const index = sensors.findIndex(s => s.id === sensorId)
            sensors.splice(index, 1)
            dispatch(
                updateModel('request', {
                    params: {
                        id: model.id,
                        sensors
                    }
                })
            )
        },
        [container, model]
    )

    const handleSensorAdd = useCallback(
        ({type, deviceCode}) => {
            if (!container || !scene.current || !camera.current) return
            dispatch(
                updateModel('request', {
                    params: {
                        id: model.id,
                        sensors: [
                            ...model.sensors,
                            {
                                id: moment().valueOf() + '_sensor',
                                type,
                                deviceCode,
                                position: {...intersectPoint.current}
                            }
                        ]
                    }
                })
            )
            setSensorUploadVisible(false)
        },
        [container, model]
    )

    const handleHiddenSensorUpload = useCallback(() => {
        setSensorUploadVisible(false)
    }, [])

    //draw sensors
    useEffect(() => {
        if (!container || !scene.current || !model) return
        renderSensors(model.sensors)
    }, [model, container])

    const sensorTypes = useSelector(state => state.modelState.sensorTypes)
    const renderSensors = useCallback(sensors => {
        let sensorsGroup = scene.current.getChildByName('sensors')
        if (sensorsGroup) scene.current.remove(sensorsGroup)
        const labelDomList = labelRendererRef.current.domElement.querySelectorAll(
            '*'
        )
        for (let dom of labelDomList)
            labelRendererRef.current.domElement.removeChild(dom)

        sensorsGroup = new THREE.Group()
        sensorsGroup.name = 'sensors'
        scene.current.add(sensorsGroup)

        for (let s of sensors) {
            const sc = sensorTypes.find(sc => sc.name === s.type)
            if (sc) {
                const tmpMesh = sc.mesh.clone()
                const scale = radius.current / 150
                const {x, y, z} = s.position
                tmpMesh.position.x = x
                tmpMesh.position.y = y
                tmpMesh.position.z = z
                tmpMesh.scale.x = scale
                tmpMesh.scale.y = scale
                tmpMesh.scale.z = scale
                tmpMesh.name = s.id

                const label = genLabel(`${sc.name}: ${s.deviceCode}`)
                tmpMesh.add(label)
                sensorsGroup.add(tmpMesh)
            }
        }
    }, [])

    const sensor = useMemo(() => {
        if (!model || !sensorId) return null
        const {sensors} = model
        return sensors.find(s => s.id === sensorId)
    }, [model, sensorId])

    return (
        <div
            ref={containerRef}
            className={styles.container}
            onClick={handleClick}
            onContextMenu={handleRightClick}>
            {sensorUploadVisible && (
                <SensorUpload
                    onSave={handleSensorAdd}
                    onCancel={handleHiddenSensorUpload}
                />
            )}
            {sensorId && (
                <SensorHandleMenu
                    top={clickPos.current.y}
                    left={clickPos.current.x}
                    onClick={handleSensorMenuEvent}
                />
            )}
            {sensorDataVisible && (
                <SensorDataVis
                    sensor={sensor}
                    onCancel={handleHideSensorData}
                />
            )}
            <Tips />
        </div>
    )
})

const genLabel = content => {
    const labelDiv = document.createElement('div')
    labelDiv.className = styles.label
    labelDiv.textContent = content

    const label = new CSS2DObject(labelDiv)

    return label
}

export default ModelDetail
