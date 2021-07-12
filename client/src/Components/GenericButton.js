import React, { Button } from "react";

export default function GenericButton(props) {
	return (
        <div className="generic-button" style={{width: '100%', textAlign: "center"}} onClick={props.onClick}>
            <div className="">{props.text}</div>
        </div>
	);
}
