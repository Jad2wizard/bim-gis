import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import elementResizeEvent from 'element-resize-event'
import { getModel } from './../Manage/actions'
import styles from './index.less'

const ObjLoader = new OBJLoader()
const MtlLoader = new MTLLoader()
const zeroPoint = new THREE.Vector3(0, 0, 0)

const Show = React.memo(() => {
    const dispatch = useDispatch()

    const [model, setModel] = useState(null)
    const modelId = location.search.split('id=')[1]
    const modelList = useSelector(state => state.manageState.modelList)

    useEffect(() => {
        if (!modelId) return
        const model = modelList.find(m => m.id === modelId)
        if (!model) {
            dispatch(getModel('request', { id: modelId }))
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

    const containerRef = useCallback(node => {
        if (node) setContainer(node)
    }, [])

    useEffect(() => {
        if (!container || !model) return

        const { clientWidth, clientHeight } = container

        scene.current = new THREE.Scene()

        camera.current = new THREE.PerspectiveCamera(
            45,
            clientWidth / clientHeight,
            1,
            200000
        )
        camera.current.position.x = 12620
        camera.current.position.y = 64238
        camera.current.position.z = 65242

        window.camera = camera.current
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
        scene.current.add(ambientLight)
        const pointLight = new THREE.PointLight(0xffffff, 0.8)
        camera.current.add(pointLight)
        scene.current.add(camera.current)

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
            MtlLoader.load(model.mtlFile, materials => {
                materials.preload()
                ObjLoader.setMaterials(materials).load(
                    model.objFile,
                    object => {
                        scene.current.add(object)
                        camera.current.lookAt(object)
                        window.object = object
                        calcObjCenter(object)
                    }
                )
            })
        } else {
            ObjLoader.load(model.objFile, object => {
                scene.current.add(object)
                camera.current.lookAt(object)
                object.current = object
                calcObjCenter(object)
            })
        }
    }, [container, model])

    const handleResize = useCallback(() => {
        const { clientWidth, clientHeight } = container

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

    const calcObjCenter = useCallback(object => {
        const res = new THREE.Vector3(0, 0, 0)
        setTimeout(() => {
            for (let child of object.children) {
                const center = child.geometry.boundingSphere.center
                res.x += center.x
                res.y += center.y
                res.z += center.z
            }
            const meshNum = object.children.length
            if (meshNum > 0) {
                res.x = res.x / meshNum
                res.y = res.y / meshNum
                res.z = res.z / meshNum
            }
            center.current = res
            console.log(res)
            control.current = new OrbitControls(
                camera.current,
                renderer.current.domElement,
                res
            )
        }, 2000)
    }, [])

    return <div ref={containerRef} className={styles.container}></div>
})

export default Show
