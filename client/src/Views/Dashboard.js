import React, { useState, useEffect, useRef } from "react";
import ChatInputBar from "../Components/ChatInputBar";
import Message from "../Components/Message";
import Firebase from '../config/Firebase'
import 'firebase/database';
import '../Styles/dashboard.css';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VideocamIcon from '@material-ui/icons/Videocam';
import environment from '../config/config'
import { CircleToBlockLoading } from 'react-loadingg';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import UserSelect from "../Components/UserSelect"
import CreateChannel from "../Components/CreateChannel"
import firebaseAdmin from 'firebase/app'
import AddCircleIcon from '@material-ui/icons/AddCircle';

const axios = require("axios").default;

export default function Dashboard() {

    const auth = Firebase.auth();
    const firestore = Firebase.firestore();
    const db = Firebase.database();
    const [cuser, setUser] = useState({});
    const [channels, setChannels] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredChannels, setFilteredChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState({
        channelName: "Conversation",
        users: []
    })
    const [inputMessage, setInputMessage] = useState("")
    const [messages, updateMessages] = useState([])
    const [isConvoOn, setConvoOn] = useState(false)
    const [loading, setLoading] = useState(true)
    const [addPersonOpen, setAddPersonOpen] = useState(false);
    const [addChannel, setAddChannel] = useState(false)
    
    const messagesEndRef = useRef(null)

    useEffect (() =>{
        auth.onAuthStateChanged(function (user) {
            if (user) {
                setUser(user);
                
                const updatedList = []
                firestore.collection("channels").where("users", "array-contains", user.uid).get()
                .then(channelListDocs => {
                    channelListDocs.forEach(channelListDoc => {
                        updatedList.push({...channelListDoc.data(), channelId: channelListDoc.id})
                    })
                    updateChannelMetadata(updatedList)
                    setChannels(updatedList)
                    setFilteredChannels(updatedList)
                    console.log(updatedList)
                })

                firestore.collection("users").doc(user.uid).get()
                .then((userDoc) => {
                    setUser(userDoc.data())
                    setLoading(false)
                })
                
            } else {
                window.location.href = '/'
            }
        })
        
    }, [])


    const updateChannelMetadata = (updatedList) => {
        new Promise(async (resolve, reject) => {
            for(const i in updatedList) {
                const users = updatedList[i].users
                updatedList[i].userNames = []
                for(const j in users){
                    const userDoc = await firestore.collection("users").doc(users[j]).get();
                    updatedList[i].userNames.push(userDoc.data().name)
                    if(j == users.length-1 && i == updatedList.length-1) resolve()
                }
            }
        })
        .then(() => {
            updateChannelName(updatedList)
        })
    }

    const updateChannelName = (list) => {
        const updatedList = list.slice()
        new Promise(async (resolve, reject) => {
            const thisUser = await firestore.collection("users").doc(auth.currentUser.uid).get()
            const thisUserName = thisUser.data().name
            for(const i in updatedList) {
                const users = updatedList[i].userNames
                var names = ""
                for(const j in users){
                    if(users[j] != thisUserName) {
                        names += users[j].split(" ")[0] + " "
                    }
                    if(j == users.length-1) {
                        names.trim()
                        names.replace(" ", ", ")
                        updatedList[i].channelName = names
                        setLoading(false)
                    }
                    if(j == users.length-1 && i == updatedList.length-1) resolve()
                }
            }
        })
        .then(() => {
            setChannels(updatedList)
            setFilteredChannels(updatedList)
        })
    }

    const sendMessageToFirestore = async (message) => {
        await firestore.collection("messages").add({
            sender: auth.currentUser.uid,
            channel: activeChannel.channelId,
            senderName: cuser.name,
            time: new Date().getTime().toString(),
            text: message
        })
    }
    
    const searchHandler = e => {
		const input = e.target.value;
		setSearch(input)
        if (input === "") {
            setFilteredChannels(channels);
            return;
        }
        const filtered = channels.filter(item => {
            return item["channelName"].toLowerCase().includes(input.toLowerCase());
        });
        setFilteredChannels(filtered);
	}

    const showChannel = channel => {
        setActiveChannel(channel)
        loadMessages(channel)
        setConvoOn(true)
    }

    const logout = () => {
        auth.signOut()
            .then(() => {
                window.location.href = '/'
            })
    }

    const sendMessage = () => {
        if(activeChannel.name == "Conversation"){
            return;
        }
        const msg = inputMessage
        sendMessageToFirestore(msg)
        loadMessages(activeChannel)
        setInputMessage("")
    }

    const loadMessages = async (u) => {
        const q1 = firestore.collection("messages").where("channel", "==", u.channelId).get();
        const [l1] = await Promise.all([q1]);
        const list1 = l1.docs
        const finalList = [];
        list1.forEach(d => finalList.push(d.data()))
        finalList.sort((a, b) => (a.time > b.time) ? 1 : -1)
        updateMessages(finalList)
        var element = document.getElementById("message-wrapper");
        element.scrollTop = element.scrollHeight;
    }

    const startCall = () => {
        axios.get(environment.backend_url)
        .then(async res => {
            await sendMessageToFirestore(cuser.name + " started a call at http://localhost:3000/"+ activeChannel.channelId +"/room/" + res.data.link)
            window.location.href ="/"+ activeChannel.channelId +"/room/" + res.data.link
            
        })
    }

    const addUserToChannel = () => {
        toggleAddPersonOpen()
    }
    
    const toggleAddPersonOpen = () => {
        setAddPersonOpen(!addPersonOpen)
    }

    const toggleNewChannel = () => {
        setAddChannel(!addChannel)
    }

    const addPeopleToChannel = (selectedList) => {
        var toAdd = selectedList.filter((user) => !activeChannel.users.includes(user.uid))
        new Promise((resolve, reject) => {
            var count = 0;
            toAdd.forEach(async user => {
                firestore.collection("channels").doc(activeChannel.channelId).update({
                    users: firebaseAdmin.firestore.FieldValue.arrayUnion(user.uid)
                }).then(() => {
                    count++
                    if(count == toAdd.length) resolve()
                })
            })
        })
        .then(() => {
            window.location.href = "/home"
        })
    }

    const createNewChannel = async (userList) => {
        addChannelToFirestore(userList)
        .then(() => {
            window.location.href = "/home"
        })
    }
    const addChannelToFirestore = async (userList) => {
        const users = [cuser.uid];
        userList.forEach(u => users.push(u.uid))
        await firestore.collection("channels").add({
            channelName: "",
            users: users
        })
    } 

	return (
        <div>
            {loading ? 
                <CircleToBlockLoading/> 
                : 
                <div className="d-container">
                    <div className="d-col font-20">
                        <div className="d-title">
                            <div style={{flex: "9"}}>
                                Microsoft Teams
                            </div>
                            <ExitToAppIcon style={{flex: "1", align: "center", position: "relative", top: "0%", height: "30px"}} onClick={logout}/>
                        </div>
                        <div style={{display: "flex", alignContent: "center", position: "relative", marginRight: "10px"}}>
                            <input name="search" onChange={searchHandler} value={search} type="text" className="form-control font-20 search" placeholder="Search" style={{flex: "7"}}/>
                            <AddCircleIcon style={{flex: "1", align: "center", position: "relative", top: "0%", height: "50px", color: "#636cff"}} onClick={toggleNewChannel}/>
                        </div>
                        <div className="channel-list">
                            {filteredChannels.map((i, k) => (
                                <div key={i.channelId} className="channel font-20" onClick={() => showChannel(i)}>
                                    <div style={{fontWeight: "bold"}}>{i.channelName}</div>
                                    <div style={{fontSize: "10px"}}>{i.channelId}</div>
                                </div>
                            ))}
                        </div>
                        
                    </div>
                    <div className="d-col-2 font-20">
                        <div className="d-title">
                            <div style={{ flex: "15"}}>
                                {activeChannel.channelName}
                            </div>
                            {isConvoOn ? <PersonAddIcon style={{flex: "1", align: "center", position: "relative", top: "0%", height: "30px"}} onClick={addUserToChannel}/> : <div/>}
                            {isConvoOn ? <VideocamIcon style={{flex: "1", align: "center", position: "relative", top: "0%", height: "30px"}} onClick={startCall}/> : <div/>}
                        </div>
                        <div className="main-wrapper" id="message-wrapper">
                            {messages.map((i, k) => {
                                return (
                                <Message text={i.text} me={(i.sender !== auth.currentUser.uid) ? false : true} senderName={i.senderName}/>
                            )})}
                        </div>
                        <div ref={messagesEndRef} />
                        {isConvoOn ? <ChatInputBar onClick={sendMessage} text={inputMessage} setInput={setInputMessage}/> : <div/>}
                    </div>
                </div>
            
            }
            {addPersonOpen && 
            <UserSelect
                handleClose={toggleAddPersonOpen}
                cuid={cuser.uid}
                onSubmit={addPeopleToChannel}
            />}
            {addChannel &&
            <CreateChannel
                handleClose={toggleNewChannel}
                cuid={cuser.uid}
                onSubmit={createNewChannel}
            /> }
        </div>
	);
}
