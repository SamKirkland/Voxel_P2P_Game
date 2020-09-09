import React from 'react';
import { PlayerSkin } from './skin.type';
import GameScreen from './GameScreen';
import { MobileControls } from "./MobileControls";
import { GameChat } from "./GameChat";
import { INetworkHandler } from "./handlers/Network";

interface IPlayerOptions {
    keyBindings?: any;
}

interface IGameProps {
    name: string;
    server: string | undefined;
    skin: PlayerSkin;
    networkHandler: INetworkHandler;
}

interface IGameState {
    playerOptions: IPlayerOptions;
}

export default class Game extends React.PureComponent<IGameProps, IGameState> {
    state: Readonly<IGameState> = {
        playerOptions: {}
    };

    render() {
        const { name, server, networkHandler } = this.props;
        // todo: settings

        const gameRoomToConnectTo = this.props.server?.trim() === "" ? undefined : this.props.server;
        
        return <>
            
            <GameScreen gameRoom={gameRoomToConnectTo} networkHandler={networkHandler} />
            <GameChat name={name} server={server} networkHandler={networkHandler} />
            <MobileControls />
        </>;
    }
}
