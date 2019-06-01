import React from 'react';
import { Route, Switch, withRouter } from "react-router";
import { hot } from 'react-hot-loader';
import isNode from 'detect-node';
import { setInitialData } from "./helpers/initialData";
import IndexPage from "client/routes/IndexPage";
import GamePage from "./routes/GamePage";
import DiscordAuthPage from "./routes/DiscordAuthPage";

class App extends React.Component {
	constructor({ initialData }) {
		super();
		
		if(isNode) {
			setInitialData(initialData);
		} else {
			setInitialData(JSON.parse(document.getElementById('initialData').textContent));
		}
	}
	
	componentDidMount() {
		this.unlisten = this.props.history.listen(() => {
			setInitialData(null);
		});
	}
	
	componentWillUnmount() {
		this.unlisten();
	}
	
	render() {
		return (
			<Switch>
				<Route path="/discordAuth" exact component={DiscordAuthPage}/>
				<Route path="/game" exact component={GamePage}/>
				<Route path="/" exact component={IndexPage}/>
			</Switch>
		)
	}
}

export default hot(module)(withRouter(App));
