import React from "react";
import { INetworkHandler, IChatMessage } from "./handlers/Network";

interface IGameChatProps {
	name: string;
	server: string | undefined;
	networkHandler: INetworkHandler;
}

interface IGameChatState {
	messages: IChatMessage[];
	draft: string;
}

// todo use react nipple
export class GameChat extends React.PureComponent<IGameChatProps> {
	state: Readonly<IGameChatState> = {
		messages: [],
		draft: ""
	};

	private chatDraft = React.createRef<HTMLInputElement>();
	private messageList = React.createRef<HTMLDivElement>();

	componentDidMount = () => {
		const { networkHandler } = this.props;

		console.log(this.chatDraft.current);
		this.chatDraft.current?.addEventListener("keydown", this.stopEvent);

		networkHandler.on("chat", this.handleChatReceived);
		networkHandler.on("userConnected", (userID, position) => {
			this.setState({
				messages: [
					...this.state.messages,
					{
						user: userID,
						content: "Connected"
					}
				]
			});
		});

		networkHandler.on("chatHistory", (chatHistory: any) => {
			console.log("chatHistory", chatHistory);
			this.setState({
				messages: chatHistory
			});
		});

		// request chat history from before login
		networkHandler.chatHistory();

		networkHandler.on("userDisconnected", (userID, position) => {
			this.setState({
				messages: [
					...this.state.messages,
					{
						user: userID,
						content: "Disconnected"
					}
				]
			});
		});
	}

	componentWillUnmount = () => {
		// todo unbind
		//this.props.networkHandler.on("chat", this.handleChatReceived);

		this.chatDraft.current?.removeEventListener("keydown", this.stopEvent);
	}

	private stopEvent = (event: Event) => {
		event.stopPropagation();
	};

	private handleChatReceived = (newMessage: IChatMessage) => {
		const messageList = this.messageList.current;
		let shouldScrollToNewMessage = false;
		if (messageList !== null) {
			// if the user is at/near the bottom of the chat window scroll down to show the most recent message
			shouldScrollToNewMessage = messageList.scrollHeight - messageList.scrollTop === messageList.clientHeight;
		}

		this.setState({
			messages: [...this.state.messages, newMessage]
		});

		if (shouldScrollToNewMessage) {
			messageList!.scrollTo(0, messageList!.scrollHeight);
		}
	}

	private handleChange = (value: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ draft: value.target.value });
	}

	private handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// todo use typescript types for key name
		if (event.key === "Enter") {
			console.log(this.state.draft);
			this.props.networkHandler.chat(this.state.draft);
			this.setState({ draft: "" });
		}
	}

	render() {
		return (
			<div style={{ position: "fixed", left: 0, bottom: 0, width: 200, background: "rgba(0, 0, 0, .5)", zIndex: 9999 }}>
				<div style={{ overflow: "auto", maxHeight: 200 }} ref={this.messageList}>
					{this.state.messages.map((message, index) =>
						<div key={index}>
							{message.user}: {message.content}
						</div>
					)}
				</div>
				{this.props.name}: <input
					type="text"
					ref={this.chatDraft}
					value={this.state.draft}
					onChange={this.handleChange}
					onKeyPress={this.handleKeyUp}
				/>
			</div>
		);
	}
}