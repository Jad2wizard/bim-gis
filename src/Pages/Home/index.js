import React, {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Layout} from 'antd'
import {getModel} from './../Manage/actions'
import Header from './Header'
import Navigator from './Navigator'
import styles from './index.less'

const Home = React.memo(props => {
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(getModel('request', {}))
	}, [])

	return (
		<Layout className={styles.container}>
			<Header className={styles.header} />
			<Navigator className={styles.nav} />
			<Layout.Content className={styles.content}>
				{props.children}
			</Layout.Content>
		</Layout>
	)
})

export default Home
