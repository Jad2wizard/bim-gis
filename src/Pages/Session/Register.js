import React from 'react'
import {connect} from 'react-redux'
import {routerActions} from 'react-router-redux'
import {Input, message} from 'antd'
import * as actions from './actions'
import styles from './Login.less'

const checkUsername = username => {
	if (!username) {
		return '用户名不能为空'
	}
	return null
}

const checkPassword = password => {
	if (!password) {
		return '密码不能为空'
	}
	return null
}

class Register extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			username: '',
			password: '',
			isRegister: false
		}
	}

	handleChange = param => {
		this.setState({
			...this.state,
			...param
		})
	}

	render() {
		const {isLoading, handleRegister, jumpToLogin} = this.props
		const {username, password} = this.state
		return (
			<div className={styles.container}>
				<section className={styles.loginBlock}>
					<header className={styles.header}>
						<p>注册</p>
					</header>
					<div className={styles.inputContainer}>
						<div className={styles.inputTitle}>
							<p>用户名</p>
						</div>
						<div className={styles.inputSection}>
							<Input
								disabled={isLoading}
								type="text"
								value={username}
								onChange={e => {
									this.handleChange({
										username: e.target.value
									})
								}}
								placeholder="请输入用户名"
							/>
						</div>
					</div>
					<div className={styles.inputContainer}>
						<div className={styles.inputTitle}>
							<p>密码</p>
						</div>
						<div className={styles.inputSection}>
							<Input
								disabled={isLoading}
								type="password"
								value={password}
								onChange={e => {
									this.handleChange({
										password: e.target.value
									})
								}}
								placeholder="请输入密码"
							/>
						</div>
					</div>
					<div className={styles.buttonContainer}>
						<button
							disabled={isLoading}
							className={`${styles.button} ${styles.confirmBtn}`}
							onClick={() => {
								handleRegister(username, password)
							}}>
							确认
						</button>
						<button
							disabled={isLoading}
							className={`${styles.button} ${styles.registerBtn}`}
							onClick={jumpToLogin}>
							取消
						</button>
					</div>
				</section>
			</div>
		)
	}
}

const mapStateToProps = state => {
	const {user, isLoading} = state.sessionState
	return {user, isLoading}
}

const mapDispatchToProps = dispatch => ({
	handleRegister: (username, password) => {
		const usnCheckRes = checkUsername(username)
		const pwdCheckRes = checkPassword(password)
		if (usnCheckRes) {
			message.warn(usnCheckRes)
			return
		}
		if (pwdCheckRes) {
			message.warn(pwdCheckRes)
			return
		}
		dispatch(actions.register('request', {username, password}))
	},
	jumpToLogin: () => {
		dispatch(routerActions.push('/login'))
	}
})

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Register)
