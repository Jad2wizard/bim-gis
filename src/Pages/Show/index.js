import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import elementResizeEvent from 'element-resize-event'
import { getModel } from './../Manage/actions'
import styles from './index.less'

window.THREE = THREE
const ObjLoader = new OBJLoader()
const MtlLoader = new MTLLoader()
const zeroPoint = new THREE.Vector3(0, 0, 0)
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
    const radius = useRef(0)

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
        // camera.current.position.x = 12620
        // camera.current.position.y = 64238
        // camera.current.position.z = 65242

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
                        window.object = object
                        calcObjCenter(object)
                    }
                )
            })
        } else {
            ObjLoader.load(model.objFile, object => {
                scene.current.add(object)
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

    const calcObjCenter = useCallback(async object => {
        const newCenter = new THREE.Vector3(0, 0, 0)
        let newRadius = 0
        for (let child of object.children) {
            let boundingSphere = child.geometry.boundingSphere
            while (!boundingSphere) {
                await delay(200)
                boundingSphere = child.geometry.boundingSphere
            }
            const { x, y, z } = boundingSphere.center
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
    }, [])

    return <div ref={containerRef} className={styles.container}></div>
})

export default Show
