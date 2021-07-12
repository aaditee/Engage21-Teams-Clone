import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createSocketConnectionInstance } from "../services/connection";
import CallIcon from "@material-ui/icons/CallEnd";
import Footbar from "../Components/Footbar";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import ChatIcon from "@material-ui/icons/Chat";
import Chatbox from "../Components/Chatbox"
import environment from '../config/config'
import Firebase from "../config/Firebase"
require('dotenv').config();

const RoomComponent = (props) => {
	let socketInstance = useRef(null);
	const [micStatus, setMicStatus] = useState(true);
	const [camStatus, setCamStatus] = useState(true);
	const [streaming, setStreaming] = useState(false);
	const [chatToggle, setChatToggle] = useState(false);
	const [userDetails, setUserDetails] = useState(null);
	const [displayStream, setDisplayStream] = useState(false);
	const [messages, setMessages] = useState([]);
	const [cuser, setUser] = useState({})

	useEffect(() => {
		return () => {
			socketInstance.current?.destoryConnection();
		};
	}, []);

	const auth = Firebase.auth()
    const firestore = Firebase.firestore()

	useEffect(() => {
		startConnection();
		auth.onAuthStateChanged(function (user) {
            if (user) {
                firestore.collection("users").doc(user.uid).get()
                .then((userDoc) => {
                    setUser(userDoc.data())
                })
            } else {
				window.location.href = '/'
			}
        })
	}, []);

	const startConnection = () => {
		console.log("starting conenction");
		socketInstance.current = createSocketConnectionInstance({
			updateInstance: updateFromInstance,
			userDetails,
		});
	};

	const updateFromInstance = (key, value) => {
		if (key === "streaming") setStreaming(value);
		if (key === "message") setMessages([...value]);
		if (key === "displayStream") setDisplayStream(value);
	};

	useLayoutEffect(() => {
		const appBar = document.getElementsByClassName("app-navbar");
		if (appBar && appBar[0]) appBar[0].style.display = "none";
		return () => {
			if (appBar && appBar[0]) appBar[0].style.display = "block";
		};
	});

	const handleDisconnect = () => {
		socketInstance.current?.destoryConnection();
		window.location.href = "/home"
	};

	const handleMyMic = () => {
		const { getMyVideo, reInitializeStream } = socketInstance.current;
		const myVideo = getMyVideo();
		if (myVideo)
			myVideo.srcObject?.getAudioTracks().forEach((track) => {
				if (track.kind === "audio")
					// track.enabled = !micStatus;
					micStatus
						? track.stop()
						: reInitializeStream(camStatus, !micStatus);
			});
		setMicStatus(!micStatus);
	};

	const handleMyCam = () => {
		if (!displayStream) {
			const { toggleVideoTrack } = socketInstance.current;
			toggleVideoTrack({ video: !camStatus, audio: micStatus });
			setCamStatus(!camStatus);
		}
	};

	const handleuserDetails = (userDetails) => {
		setUserDetails(userDetails);
	};

	const chatHandle = (bool = false) => {
		setChatToggle(bool);
	};

	const toggleScreenShare = () => {
		const { reInitializeStream, toggleVideoTrack } = socketInstance.current;
		displayStream && toggleVideoTrack({ video: false, audio: true });
		reInitializeStream(
			false,
			true,
			!displayStream ? "displayMedia" : "userMedia"
		).then(() => {
			setDisplayStream(!displayStream);
			setCamStatus(false);
		});
	};

	return (
		<React.Fragment>
			<div style={{height: '100%'}}>
				{
					// userDetails !== null &&
					!streaming && (
						<div className="stream-loader-wrapper">
							{/* <CircularProgress className="stream-loader" size={24} color="primary" /> */}
						</div>
					)
				}
				<div id="room-container"></div>

				<Footbar>
                    <div>
                        <div>Teams</div>
                    </div>
                    <div className="footbar-buttons-div">
                        <div className="footer-button" onClick={handleMyMic} title={micStatus ? 'Disable Mic' : 'Enable Mic'}>
                            {micStatus ? <MicIcon></MicIcon> : <MicOffIcon></MicOffIcon>}
                        </div>
                        <div className="footer-button" onClick={handleDisconnect} title="End Call">
                            <CallIcon/>
                        </div>
                        <div className="footer-button" onClick={handleMyCam} title={camStatus ? 'Disable Cam' : 'Enable Cam'}>
                            {camStatus ? <VideocamIcon></VideocamIcon> : <VideocamOffIcon></VideocamOffIcon>}
                        </div>
                    </div>
                    <div className="footbar-buttons-div">
                        <div className="footer-button" onClick={toggleScreenShare} title={displayStream ? 'Stop Screen Share' : 'Share Screen'}>
                            {displayStream ? <StopScreenShareIcon></StopScreenShareIcon> : <ScreenShareIcon></ScreenShareIcon>}
                        </div>
                        <div className="footer-button" onClick={() => chatHandle(!chatToggle)} title="Chat">
                            <ChatIcon/>
                        </div>
                    </div>
                </Footbar>

				{/* <UserPopup submitHandle={handleuserDetails}></UserPopup> */}
				<Chatbox 
					chatToggle={chatToggle} 
					closeDrawer={() => chatHandle(false)} 
					socketInstance={socketInstance.current} 
					myDetails={userDetails} 
					channelId={window.location.pathname.split("/")[1]}
					messages={messages}>
				</Chatbox>
				{/* <ToastContainer 
                autoClose={2000}
                closeOnClick
                pauseOnHover
            /> */}
			</div>
		</React.Fragment>
	);
};

function getObjectFromUrl(url) {
	if (!url) url = window.location.search;
	let result = null;
	if (url?.length) {
		result = {};
		let query = url.substr(1);
		query.split("&").forEach(function (part) {
			let item = part.split("=");
			result[item[0]] = decodeURIComponent(item[1]);
		});
	}
	console.log(result);
	return result;
}

export default RoomComponent;
