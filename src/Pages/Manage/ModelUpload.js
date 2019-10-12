import React, {useState, useCallback} from 'react'
import {Form, Upload, Button, Icon} from 'antd/lib/index'

const Home = React.memo(({}) => {
    const [mtlFile, setMtlFile] = useState([])
    const [objFile, setObjFile] = useState([])

    const onMtlChange = useCallback(file => {
        console.log(file)
        setMtlFile([file])
        return false
    }, [])

    const onObjChange = useCallback(file => {
        console.log(file)
        setObjFile([file])
        return false
    }, [])

    const handleSubmit = useCallback(() => {
        const formData = new FormData()
        mtlFile.length > 0 && formData.append('mtlFile', mtlFile[0])
        objFile.length > 0 && formData.append('objFile', objFile[0])
        formData.append('name', 'test')
        formData.append('type', 'obj')
        formData.append('desc', 'test description')
        fetch(
            '/model',
            {
                method: 'POST',
                body: formData
            })
    }, [mtlFile, objFile])

    return <div style={{width: '100%', height: '100%'}}>
        <Upload
            fileList={mtlFile}
            accept=".mtl"
            beforeUpload={onMtlChange}
            onRemove={() => setMtlFile([])}
        >
            <Button>
                <Icon type="upload"/> 点击上传 mtl 文件
            </Button>
        </Upload>
        <Upload
            fileList={objFile}
            accept=".obj"
            beforeUpload={onObjChange}
            onRemove={() => setObjFile([])}
        >
            <Button>
                <Icon type="upload"/> 点击上传 obj 文件
            </Button>
        </Upload>
        <Button onClick={handleSubmit}>上传</Button>
    </div>
})

export default Home