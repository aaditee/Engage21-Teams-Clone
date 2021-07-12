import React from "react";
import '../Styles/dashboard.css';
import SendIcon from '@material-ui/icons/Send';

export default function ChatInputBar(props) {

    const changeHandler = e => {
        props.setInput(e.target.value)
    }

	return (
        <div className="input-bar">
            <input className="form-control" placeholder="Type here..." value={props.text} onChange={changeHandler}/>
            <div style={{backgroundColor: "#6c63ff", color: "white", borderRadius: "5px", paddingLeft: "10px", marginLeft: "10px", marginRight: "10px", height: "38px", textAlign: "center", paddingRight: "10px"}}>
                <SendIcon onClick={props.onClick}/>
            </div>
        </div>
	);
}
