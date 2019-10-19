import React, {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {routerActions} from 'react-router-redux'
import {Button} from 'antd'
import {setUploadVisible, delModel} from './actions'
import ModelUpload from './Upload'
import ModelCard from './ModelCard'
import styles from './index.less'

const Manage = React.memo(() => {
	const dispatch = useDispatch()
	const uploadVisible = useSelector(state => state.manageState.uploadVisible)
	const modelList = useSelector(state => state.manageState.modelList)

	const uploadVisibleChange = useCallback(visible => {
		dispatch(setUploadVisible(visible))
	}, [])

	const handleClickModel = useCallback(modelId => {
		dispatch(routerActions.push(`/show?id=${modelId}`))
	}, [])

	const handleDeleteModel = useCallback(modelId => {
		dispatch(delModel('request', {modelId}))
	}, [])

	return (
		<div className={styles.container}>
			<Button type="primary" onClick={() => uploadVisibleChange(true)}>
				添加模型
			</Button>
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
			{uploadVisible && (
				<ModelUpload onCancel={() => uploadVisibleChange(false)} />
			)}
		</div>
	)
})

export default Manage
