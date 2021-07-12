import React, { useState, useEffect } from 'react';
import { Button, Drawer, Input } from '@material-ui/core';
// Import Styles
import '../Styles/chatbox.scss';
// Import Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChatIcon from '@material-ui/icons/Chat';
import Firebase from "../config/Firebase";
import Message from "../Components/Message"

 

function Chatbox(props) {

    const auth = Firebase.auth()
    const firestore = Firebase.firestore()

    const [chatText, setChatText] = useState('');
    const [cuser, setUser] = useState({})
    const [messages, setMessages] = useState([])
    const channelId = props.channelId

    useEffect (() =>{
        auth.onAuthStateChanged(function (user) {
            if (user) {
                firestore.collection("users").doc(user.uid).get()
                .then((userDoc) => {
                    setUser(userDoc.data())
                })
            }
        })
        loadMessages()
    }, [])

    const handleChatText = (event) => {
        const { value } = event.target;
        setChatText(value);
    }

    const handleSendText = (event) => {
        if (!(chatText.length > 0)) return;
        if (event.type === 'keyup' && (event).key !== 'Enter') {
            return;
        }
        const msg = chatText
        sendMessageToFirestore(msg)
        loadMessages()
        setChatText('');
    }

    const sendMessageToFirestore = async (message) => {
        await firestore.collection("messages").add({
            sender: auth.currentUser.uid,
            channel: channelId,
            senderName: cuser.name,
            time: new Date().getTime().toString(),
            text: message
        })
    }

    const loadMessages = async () => {
        const q1 = firestore.collection("messages").where("channel", "==", channelId).get();
        const [l1] = await Promise.all([q1]);
        const list1 = l1.docs
        const finalList = [];
        list1.forEach(d => finalList.push(d.data()))
        finalList.sort((a, b) => (a.time > b.time) ? 1 : -1)
        setMessages(finalList)
    }

    return (
        <React.Fragment>
            <Drawer className="chat-drawer" anchor={'right'} open={props.chatToggle} onClose={props.closeDrawer}>
                <div className="chat-head-wrapper">
                    <div className="chat-drawer-back-icon" onClick={props.closeDrawer}>
                        <ChevronRightIcon></ChevronRightIcon>
                    </div>
                    <div className="chat-header">
                        <ChatIcon></ChatIcon>
                        <h3 className="char-header-text">Chat</h3>
                    </div>
                </div>
                <div className="chat-drawer-list">
                    {messages.map((i, k) => {
                        return (
                        <Message key={k} text={i.text} me={(i.sender !== auth.currentUser.uid) ? false : true} senderName={i.senderName}/>
                    )})}
                </div>
                {/* <List className="chat-drawer-list">
                    
                </List> */}
                <div className="chat-drawer-input-wrapper" onKeyUp={handleSendText}>
                    <Input 
                        className="chat-drawer-input" 
                        onChange={handleChatText} 
                        value={chatText}
                        placeholder="Type Here"
                    />
                    <Button onClick={handleSendText}>Send</Button>
                </div>
            </Drawer>
        </React.Fragment>
    )
}

export function getMessageDateOrTime(date=null) {
    if (date !== null) {
        const dateObj = new Date(date);
        const dateDetails = {
            date: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear(),
            hour: dateObj.getHours(),
            minutes: dateObj.getMinutes()
        }
        const currentDateObj = new Date();
        const currentDateDetails = {
            date: currentDateObj.getDate(),
            month: currentDateObj.getMonth() + 1,
            year: currentDateObj.getFullYear(),
            hour: currentDateObj.getHours(),
            minutes: currentDateObj.getMinutes()
        }
        if (dateDetails.year !== currentDateDetails.year && dateDetails.month !== currentDateDetails.month && dateDetails.date !== currentDateDetails.date) {
            return dateDetails.date + '-' + dateDetails.month + '-' + dateDetails.year;
        } else {
            return dateDetails.hour + ':' + dateDetails.minutes + ` ${dateDetails.hour < 12 ? 'AM' : 'PM'}`
        }

    }
    return '';
}

export default Chatbox;