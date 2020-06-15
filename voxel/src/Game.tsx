import React from 'react';
import { PlayerSkin } from './skin.type';
import GameScreen from './GameScreen';
import { MobileControls } from "./MobileControls";
import { GameChat } from "./GameChat";

interface IPlayerOptions {
    keyBindings?: any;
}

interface IGameProps {
    name: string;
    server: string | undefined;
    skin: PlayerSkin;
}

interface IGameState {
    playerOptions: IPlayerOptions;
}

export default class Game extends React.PureComponent<IGameProps, IGameState> {
    state: Readonly<IGameState> = {
        playerOptions: {}
    };

    render() {
        const { name, server, skin } = this.props;
        // todo: settings

        const gameRoomToConnectTo = this.props.server?.trim() === "" ? undefined : this.props.server;
        
        return <>
            
            <GameScreen gameRoom={gameRoomToConnectTo} />
            <GameChat name={name} server={server} />
            <MobileControls />
        </>;
    }
}
