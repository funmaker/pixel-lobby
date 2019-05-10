import React from 'react';
import Game from "../game/game";

const pages = new Set();

export default class IndexPage extends React.Component {
	state = {
		chat: null,
	};
	
	canvas = React.createRef();
	chat = React.createRef();
	youtube = React.createRef();
	game = new Game();
	
	async componentDidMount() {
		this.game.start(this.canvas.current);
		document.addEventListener("keypress", this.onKeyPress);
		pages.add(this);
	}
	
	componentWillUnmount() {
		this.game.stop();
		document.removeEventListener("keypress", this.onKeyPress);
		pages.remove(this);
	}
	
	onKeyPress = (ev) => {
		if(ev.code === "Enter") {
			if(this.state.chat === null) {
				this.setState({ chat: "" }, () => this.chat.current.focus());
			} else {
				this.game.onChat(this.state.chat);
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
			<div className="IndexPage">
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
