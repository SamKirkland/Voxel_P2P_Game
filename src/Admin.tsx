import React from 'react';
import { INetworkHandler, IServerState } from "./handlers/Network";
import { SocketIOHandler } from "./handlers/SocketIOHandler";



interface IAdminProps {
}

interface IAdminState {
	networkHandler: INetworkHandler;
	serverState: IServerState | null;
	lastUpdatedTime: Date | null;
}

export default class Admin extends React.PureComponent<IAdminProps, IAdminState> {
	state: Readonly<IAdminState> = {
		networkHandler: new SocketIOHandler("http://localhost:9900"), //new LoggingNetworkHandler()
		serverState: null,
		lastUpdatedTime: null
	};

	componentDidMount = () => {
		const { networkHandler } = this.state;

		networkHandler.on("serverStateUpdate", this.handleUpdate);
	}

	componentWillUnmount = () => {
		// todo unbind
		//this.props.networkHandler.on("chat", this.handleChatReceived);
	}

	private handleUpdate = (newState: IServerState) => {
		this.setState({
			serverState: newState,
			lastUpdatedTime: new Date()
		});
	}

	render() {
		// todo pull out into TimeDisplay component
		let o = new Intl.DateTimeFormat("en", {
			timeStyle: "long"
		} as any);

		return <div style={{ color: "black" }}>
			Admin Page!!!<br />
			Last Updated: {this.state.lastUpdatedTime === null ? "Never" : o.format(this.state.lastUpdatedTime)}<br />
			<br />
			<br />
			Server State:
			<pre>
				{JSON.stringify(this.state.serverState, undefined, "\t")}
			</pre>
		</div>;
	}
}
