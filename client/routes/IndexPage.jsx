import React from 'react';
import * as qs from "query-string";
import { fetchInitialData, getInitialData } from "../helpers/initialData";

const randomMagic = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default class IndexPage extends React.Component {
	state = {
		discordClientId: null,
		...getInitialData(),
		name: null,
		magic: randomMagic(),
	};
	
	nameInput = React.createRef();
	
	async componentDidMount() {
		this.Game = (await import("../game/game")).default;
		this.setState({
			...await fetchInitialData(),
		})
	}
	
	componentDidUpdate() {
		if(this.state.name !== null) {
			this.nameInput.current.focus();
		}
	}
	
	toggleInput = () => {
		this.setState(state => ({
			name: state.name === null ? "" : null,
		}))
	};
	
	onNameChange = (ev) => {
		this.setState({
			name: ev.target.value,
		});
	};
	
	onNameKeyPress = (ev) => {
		if(ev.key === "Enter") this.guestJoin();
	};
	
	guestJoin = () => {
		this.Game.auth = { name: this.state.name };
		this.props.history.push("/game");
	};
	
	discordPopup = () => {
		if(!this.state.discordClientId) return;
		const query = {
			response_type: "code",
			client_id: this.state.discordClientId,
			scope: "identify",
			redirect_uri: location.origin + "/discordAuth",
			state: this.state.magic,
		};
		const width = 800;
		const height = 800;
		const left = screen.width / 2 - width / 2;
		const top = screen.height / 2 - height / 2;
		const popup = window.open(`https://discordapp.com/api/oauth2/authorize?${qs.stringify(query)}`, "Discord",
			"toolbar=no, location=no, directories=no, status=no, " +
			"menubar=no, scrollbars=no, copyhistory=no, " +
			`width=${width}, height=${height}, top=${top}, left=${left}`);
		window.authCallback = this.discordJoin;
	};
	
	discordJoin = (discordCode, magic) => {
		if(magic !== this.state.magic) return console.error("Unauthorized authentication!");
		
		this.Game.auth = {
			discordCode,
			discordRedirect: location.origin + "/discordAuth",
		};
		this.props.history.push("/game");
	};
	
	render() {
		return (
			<div className="IndexPage">
        <div className="board">
          <img src="/static/images/menu/pixel-lobby.png" className="logo" alt="logo" width="86" height="59" />
          <img src="/static/images/menu/login.png" className={`button login${this.state.discordClientId ? "" : " disabled"}`}
							 alt="Login with Discord" width="116" height="14" onClick={this.discordPopup} />
					{this.state.name === null
						? <img src="/static/images/menu/join.png" className="button join" alt="Join as Guest" width="84" height="15" onClick={this.toggleInput} />
						: <div className="nameWrap">
								<input className="input" value={this.state.name} onChange={this.onNameChange} onKeyPress={this.onNameKeyPress} ref={this.nameInput} />
								<img src="/static/images/menu/join2.png" className="button join" alt="Join" width="20" height="7" onClick={this.guestJoin} />
							</div>
					}
        </div>
			</div>
		)
	}
}
