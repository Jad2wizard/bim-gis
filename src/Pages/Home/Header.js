import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Tooltip, Icon } from 'antd'
import { logout } from './../Session/actions'
import styles from './Header.less'

const Header = React.memo(({ className }) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.sessionState.user)

    const handleLogout = useCallback(() => {
        dispatch(logout('request'))
    }, [])

    return (
        <header className={styles.header + ' ' + className}>
            <h1>BIM && GIS</h1>
            <Tooltip title="点击退出登录" placement="bottomLeft">
                <div className={styles.logout} onClick={handleLogout}>
                    <Icon type="logout" />
                    <span>{user || ''}</span>
                </div>
            </Tooltip>
        </header>
    )
})

export default Header
