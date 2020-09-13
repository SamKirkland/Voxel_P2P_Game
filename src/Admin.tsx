import React from "react";
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

		if (this.state.serverState === null) {
			return (<div>No state yet</div>);
		}

		return <div style={{ color: "black" }}>
			Admin Page!!!<br />
			Last Updated: {this.state.lastUpdatedTime === null ? "Never" : o.format(this.state.lastUpdatedTime)}<br />
			<br />
			<br />

			<div>
				<div aria-controls="panel1d-content" id="panel1d-header">
					Chat Messages
				</div>
				<div>
					{this.state.serverState.chat.map((message) => (
						<div>
							{message.user}<br />
							{message.content}
						</div>
					))}
				</div>
			</div>
			<div>
				<div aria-controls="panel2d-content" id="panel2d-header">
					Players
				</div>
				<div>
					{Object.keys(this.state.serverState.players).map((playerId) => {
						const player = this.state.serverState?.players[playerId]!;

						return (
							<div>
								{player.name}<br />
								{player.socketId}
							</div>
						);
					})}
				</div>
			</div>

			Server State:
			<pre>
				{JSON.stringify(this.state.serverState, undefined, "\t")}
			</pre>
		</div>;
	}
}
