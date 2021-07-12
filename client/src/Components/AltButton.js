import React, { Button } from "react";

export default function AltButton(props) {
	return (
        <div className="alt-button" style={{width: '100%', textAlign: "center"}} onClick={props.onClick}>
            <div className="">{props.text}</div>
        </div>
	);
}
