import React from "react";
import ReactNipple from "react-nipple";

interface IMobileControlsProps {

}

// todo use react nipple
export class MobileControls extends React.PureComponent<IMobileControlsProps> {
    render() {
        return (
            <div>
                <ReactNipple
                    options={{ mode: 'static', position: { top: '50px', left: '50px' }, color: "#000" }}
                    style={{
                        outline: `1px dashed red`,
                        width: 150,
                        height: 150,
                        position: "fixed",
                        zIndex: 9999,
                        left: 0,
                        bottom: 0
                    }}
                    onMove={(evt: any, data: any) => {
                        console.log(data);

                        if (data.distance > 20 && data.direction.y === "up" && data.direction.angle === "up") {
                            console.log("run foward");
                            const e = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "w", shiftKey: false });
                            document.dispatchEvent(e);
                        }
                    }}
                />
                <ReactNipple
                    options={{ mode: 'static', position: { top: '50px', left: '50px' }, color: "#000" }}
                    style={{
                        outline: `1px dashed red`,
                        width: 150,
                        height: 150,
                        position: "fixed",
                        zIndex: 9999,
                        right: 0,
                        bottom: 0
                    }}
                    onMove={(evt: any, data: any) => console.log(evt, data)}
                />
            </div>
        );
    }
}