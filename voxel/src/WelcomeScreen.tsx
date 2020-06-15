import React, { Suspense, ChangeEvent } from 'react';
import { PlayerSkin } from './skin.type';
import { getRandomName, getRandomInt } from './utils';
import "./WelcomeScreen.scss";
import { availableSkins } from "./GameScreen";
import { RadioGroup, RadioItem } from "./RadioGroup";
const Game = React.lazy(() => import('./Game'));

interface IWelcomeScreenProps { }

interface IWelcomeScreenState {
    name: string;
    gameRoom: string;
    skin: PlayerSkin;
    server: string | undefined;
    currentScreen: "main" | "skin" | "server" | "game";
}

const availableSkinsAsArray: PlayerSkin[] = Object.values(availableSkins);

export class WelcomeScreen extends React.Component<IWelcomeScreenProps, IWelcomeScreenState> {
    state: Readonly<IWelcomeScreenState> = {
        name: "New player",
        gameRoom: getRandomName() + getRandomInt(10, 99),
        server: undefined,
        skin: availableSkinsAsArray[0],
        currentScreen: "main"
    };

    componentDidMount = () => {
        //GlobalFunctions.listenForConnections(self.gameRoomName);
    }

    componentWillUnmount = () => {
        // send logout event
        // close listeners
    }

    private handleJoinGame = () => {
        //GlobalFunctions.connectToPlayer(self.roomToJoin());
        //self.startGame();
        this.setState({
            currentScreen: "game",
            server: this.state.gameRoom
        });
    }

    private handleHostGame = () => {
        //GlobalFunctions.startGame();
        //self.gameHasBeenStarted(true);
        this.setState({
            currentScreen: "game",
            server: this.state.gameRoom
        });
    }

    private handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            [event.target.name as "gameRoom"]: event.target.value
        });
    }

    private handleSkinChange = (name: string, value: keyof typeof availableSkins) => {
        this.setState({
            skin: availableSkins[value]
        });
    }

    render() {
        const { currentScreen, name, skin, gameRoom, server } = this.state;

        if (currentScreen === "game") {
            return <Suspense fallback={<div>Loading...</div>}>
                <Game name={name} skin={skin} server={server} />
            </Suspense>
        }


        return <div className="grid-container">
            <div className="Login">

                <h4>Pick Skin</h4>
                <RadioGroup>
                    {availableSkinsAsArray.map(skin =>
                        <RadioItem<keyof typeof availableSkins>
                            key={skin.name}
                            name="skin"
                            value={skin.name.toLowerCase() as any}
                            checked={this.state.skin.name === skin.name}
                            onChange={this.handleSkinChange}
                        >
                            <img
                                src={skin.preview}
                                alt={`${skin.name} Preview`}
                                style={{ height: 50 }}
                            />
                        </RadioItem>
                    )}
                </RadioGroup>

                <label>
                    Nick Name:
                    <input type="text" name="name" className="input" value={name} onChange={this.handleChange} />
                </label>

                <label>
                    Game Room Name:
                    <input type="text" name="gameRoom" className="input" value={gameRoom} onChange={this.handleChange} />
                </label>
                <button onClick={this.handleHostGame}>Play Solo</button>
                <button onClick={this.handleJoinGame}>Join Team</button>
                <button onClick={this.handleHostGame}>Create Team</button>
            </div>
        </div>;
    }
}
