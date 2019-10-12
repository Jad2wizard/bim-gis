import React, { useState, useCallback } from 'react'
import { Layout } from 'antd'
import Header from './Header'
import Navigator from './Navigator'
import styles from './index.less'

const Home = React.memo(props => {
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
