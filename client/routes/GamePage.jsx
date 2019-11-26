import React from 'react';

const pages = new Set();

export default class GamePage extends React.Component {
	state = {
		chat: null,
	};
	
	canvas = React.createRef();
	chat = React.createRef();
	youtube = React.createRef();
	
	async componentDidMount() {
		const Game = (await import("../game/game")).default;
		if(!Game.auth) {
			this.props.history.replace("/");
			return;
		}
		this.game = new Game();
		this.game.start(this.canvas.current);
		document.addEventListener("keypress", this.onKeyPress);
		pages.add(this);
	}
	
	componentWillUnmount() {
		if(!this.game) return;
		
		this.game.stop();
		document.removeEventListener("keypress", this.onKeyPress);
		pages.remove(this);
	}
	
	onKeyPress = (ev) => {
		if(ev.code === "Enter") {
			if(this.state.chat === null) {
				this.setState({ chat: "" }, () => this.chat.current.focus());
			} else {
				if(this.state.chat) this.game.onChat(this.state.chat);
				this.setState({
					chat: null,
				})
			}
		}
	};
	
	onChatChange = (ev) => {
		this.setState({ chat: ev.target.value })
	};
	
	onBlur = () => {
		this.setState({ chat: null });
	};
	
	render() {
		return (
			<div className="GamePage">
				<canvas className="mainCanvas" ref={this.canvas} />
				<div className={`chatInput${this.state.chat === null ? " hidden" : ""}`}>
					<input value={this.state.chat || ""} ref={this.chat}
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