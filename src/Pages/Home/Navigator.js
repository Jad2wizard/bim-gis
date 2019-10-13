import React, { useEffect, useCallback } from 'react'
import { Menu, Icon } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { routerActions } from 'react-router-redux'
import styles from './Navigator.less'

const Item = Menu.Item

const NAV_LIST = [
    {
        key: '/manage',
        text: '模型管理',
        icon: 'home'
    },
    {
        key: '/show',
        text: '模型展示',
        icon: 'read'
    },
    {
        key: '/map',
        text: 'GIS',
        icon: 'global'
    },
    {
        key: '/help',
        text: '帮助',
        icon: 'question-circle'
    }
]

const Nav = React.memo(({ className = '' }) => {
    const currPath = useSelector(
        state => state.routing.locationBeforeTransitions.pathname
    )
    const dispatch = useDispatch()

    const onLocationChange = useCallback(path => {
        dispatch(routerActions.push(path))
    }, [])

    const onNavChange = useCallback(param => {
        onLocationChange(param.key)
    }, [])

    useEffect(() => {
        currPath === '/' && onLocationChange(NAV_LIST[0].key)
    }, [currPath])

    return (
        <div className={styles.navContainer + ' ' + className}>
            <Menu onClick={onNavChange} selectedKeys={[currPath]}>
                {NAV_LIST.map(nav => (
                    <Item key={nav.key}>
                        <Icon type={nav.icon} />
                        {nav.text}
                    </Item>
                ))}
            </Menu>
        </div>
    )
})

export default Nav
