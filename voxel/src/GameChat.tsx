import React from "react";

interface IGameChatProps {
    name: string;
    server: string | undefined;
}

// todo use react nipple
export class GameChat extends React.PureComponent<IGameChatProps> {
    render() {
        return (
            <div style={{ position: "fixed", left: 0, bottom: 0, width: 200, maxHeight: 200, background: "rgba(0, 0, 0, .5)" }}>
                <input type="text" />
            </div>
        );
    }
}