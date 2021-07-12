import React, { Button } from "react";
import Linkify from 'react-linkify';

export default function Message(props) {
    const fromMe = props.me
    var styleClass = ""
    var innerClass = ""
    if (fromMe == true) {
        styleClass = "sent"
        innerClass = "message"
    } 
    else {
        styleClass = "recieved"
        innerClass = "message bg"
    }
	return (
        <div>
            {fromMe ? <div/> : <div style={{fontSize: "10px", fontWeight: "bold", marginLeft: "20px"}}>{props.senderName}</div>}
            <div className={styleClass} onClick={props.onClick}>
                <div className={innerClass}>
                    <Linkify>{props.text}</Linkify>
                </div>
            </div>
        </div>
        
	);
}
