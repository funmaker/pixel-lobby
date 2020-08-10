import React from 'react';

const pages = new Set();

export default class GamePage extends React.Component {
	state = {
		chatInput: null,
		chat: [],
	};
	
	canvas = React.createRef();
	chat = React.createRef();
	youtube = React.createRef();
	
	async componentDidMount() {
		const Game = (await import("../game/game")).default;
		if(!Game.auth) {
			this.onLogout();
			return;
		}
		this.game = new Game();
		this.game.start(this.canvas.current);
		this.game.on("logout", this.onLogout);
		this.game.on("chat", this.onChat);
		document.addEventListener("keypress", this.onKeyPress);
		pages.add(this);
	}
	
	componentWillUnmount() {
		if(!this.game) return;
		
		this.game.off("logout", this.onLogout);
		this.game.off("chat", this.onChat);
		this.game.stop();
		document.removeEventListener("keypress", this.onKeyPress);
		pages.delete(this);
	}
	
	onLogout = () => {
		this.props.history.replace("/");
	};
	
	onChat = line => {
		this.setState(state => ({
			chat: [
				...state.chat,
				line
			]
		}));
	};
	
	onKeyPress = (ev) => {
		if(ev.code === "Enter") {
			if(this.state.chatInput === null) {
				this.setState({ chatInput: "" }, () => this.chat.current.focus());
			} else {
				if(this.state.chatInput) this.game.onChat(this.state.chatInput);
				this.setState({
					chatInput: null,
				})
			}
		}
	};
	
	onChatChange = (ev) => {
		this.setState({ chatInput: ev.target.value })
	};
	
	onBlur = () => {
		this.setState({ chatInput: null });
	};
	
	render() {
		return (
			<div className="GamePage">
				<canvas className="mainCanvas" ref={this.canvas} />
				<div className={`chat`}>
					<div className="log">
						{this.state.chat.map(line => <div className="line">{line}</div>)}
					</div>
					<input value={this.state.chatInput || ""} ref={this.chat}
								 onChange={this.onChatChange} onBlur={this.onBlur}
								 onKeyDown={ev => ev.stopPropagation()} onKeyUp={ev => ev.stopPropagation()} />
				</div>
			</div>
		)
	}
}

if(module.hot) {
	module.hot.accept("../game/game", () => {
		const Game = require("../game/game").default;
		for(const page of pages) {
			page.game.stop();
			page.game = new Game();
			page.game.start(page.canvas.current);
		}
	})
}
