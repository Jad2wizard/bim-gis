import React, {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {routerActions} from 'react-router-redux'
import {Button} from 'antd'
import {setModelUploadVisible, delModel} from './actions'
import ModelUpload from './ModelUpload'
import ModelCard from './ModelCard'
import styles from './index.less'

const Manage = React.memo(() => {
    const dispatch = useDispatch()
    const modelUploadVisible = useSelector(
        state => state.manageState.modelUploadVisible
    )
    const modelList = useSelector(state => state.manageState.modelList)

    const modelUploadVisibleChange = useCallback(
        visible => {
            dispatch(setModelUploadVisible(visible))
        },
        [dispatch]
    )

    const handleClickModel = useCallback(
        modelId => {
            dispatch(routerActions.push(`/show?id=${modelId}`))
        },
        [dispatch]
    )

    const handleDeleteModel = useCallback(
        modelId => {
            dispatch(delModel('request', {modelId}))
        },
        [dispatch]
    )

    return (
        <div className={styles.container}>
            <Button
                type="primary"
                onClick={() => modelUploadVisibleChange(true)}>
                添加模型
            </Button>
            <Button type="primary">新增传感器</Button>
            <div className={styles.modelList}>
                {modelList.map(model => (
                    <ModelCard
                        model={model}
                        key={model.id}
                        onSelect={handleClickModel}
                        onDelete={handleDeleteModel}
                    />
                ))}
                <div key="hidden1" className={styles.hiddenDiv}></div>
                <div key="hidden2" className={styles.hiddenDiv}></div>
                <div key="hidden3" className={styles.hiddenDiv}></div>
                <div key="hidden4" className={styles.hiddenDiv}></div>
            </div>
            {modelUploadVisible && (
                <ModelUpload onCancel={() => modelUploadVisibleChange(false)} />
            )}
        </div>
    )
})

export default Manage
