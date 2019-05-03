import React from 'react'
import { fetchInitialData, getInitialData } from "../helpers/initialData";
import { registerCanvas } from "../game/canvas";
import game from "../game/game";

export default class IndexPage extends React.Component {
	state = {
		...getInitialData(),
	};
	
	canvas = React.createRef();
	
	async componentDidMount() {
		this.setState({
			...(await fetchInitialData()),
		});
		
		registerCanvas(this.canvas.current);
		game.start();
	}
	
	render() {
		return (
			<div className="IndexPage">
				<canvas className="mainCanvas" ref={this.canvas} />
			</div>
		)
	}
}
