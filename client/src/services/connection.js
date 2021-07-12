import openSocket from 'socket.io-client';
import Peer from 'peerjs';
// import { toast } from 'react-toastify';
// @ts-ignore
// const { websocket, peerjsEndpoint } = env_config;

const io = require('socket.io-client');

let socketInstance = null;
let peers = {};

class SocketConnection {
    videoContainer = {};
    message = [];
    settings;
    streaming = false;
    myPeer;
    socket;
    isSocketConnected = false;
    isPeersConnected = false;
    myID = '';

    constructor (settings) {
        this.settings = settings;
        this.myPeer = initializePeerConnection();
        this.socket = initializeSocketConnection();
        if (this.socket) this.isSocketConnected = true; 
        if (this.myPeer) this.isPeersConnected = true;
        this.initializeSocketEvents();
        this.initializePeersEvents();
    }

    initializeSocketEvents = () => {
        this.socket.on('connect', () => {
            console.log('socket connected');
        });
        this.socket.on('user-disconnected', (userId) => {
            console.log('user disconnected-- closing peers', userId);
            peers[userId] && peers[userId].close();
            this.removeVideo(userId);
        });
        this.socket.on('disconnect', () => {
            console.log('socket disconnected --');
        });
        this.socket.on('error', (err) => {
            console.log('socket error --', err);
        });
        this.socket.on('new-broadcast-messsage', (data) => {
            this.message.push(data);
            this.settings.updateInstance('message', this.message);
        });
        this.socket.on('display-media', (data) => {
            if (data.value) checkAndAddClass(this.getMyVideo(data.userId), 'displayMedia');
            else checkAndAddClass(this.getMyVideo(data.userId), 'userMedia');
        });
    }

    initializePeersEvents = () => {
        this.myPeer.on('open', (id) => {
            const { userDetails } = this.settings;
            this.myID = id;
            const roomId = window.location.pathname.split('/')[2];
            const userData = {
                userId: id, roomId, ...userDetails
            }
            console.log('peers established and joined room', userData);
            this.socket.emit('join-room', userData);
            this.setNavigatorToStream();
        });
        this.myPeer.on('error', (err) => {
            console.log('peer connection error', err);
            this.myPeer.reconnect();
        })
    }

    setNavigatorToStream = () => {
        this.getVideoAudioStream().then((stream) => {
            if (stream) {
                this.streaming = true;
                this.settings.updateInstance('streaming', true);
                this.createVideo({ id: this.myID, stream });
                this.setPeersListeners(stream);
                this.newUserConnection(stream);
            }
        })
    }

    getVideoAudioStream = (video=true, audio=true) => {
        let quality = this.settings.params?.quality;
        if (quality) quality = parseInt(quality);
        const myNavigator = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;
        return myNavigator({
            video: video ? {
                frameRate: quality ? quality : 12,
                noiseSuppression: true,
                width: {min: 640, ideal: 1280, max: 1920},
                height: {min: 480, ideal: 720, max: 1080}
            } : false,
            audio: audio,
        });
    }

    setPeersListeners = (stream) => {
        this.myPeer.on('call', (call) => {
            console.log("got a call...")
            call.answer(stream);
            call.on('stream', (userVideoStream) => {
                this.createVideo({ id: call.metadata.id, stream: userVideoStream });
                console.log("c", call.metadata.id)
                console.log(document.getElementById(call.metadata.id))
            });
            call.on('close', () => {
                console.log('closing peers listeners', call.metadata.id);
                this.removeVideo(call.metadata.id);
            });
            call.on('error', () => {
                console.log('peer error ------');
                this.removeVideo(call.metadata.id);
            });
            peers[call.metadata.id] = call;
        });
    }

    newUserConnection = (stream) => {
        this.socket.on('user-connected', (userData) => {
            console.log('New User Connected', userData);
            sleep(1000)
            this.connectToNewUser(userData, stream);
        });
    }

    connectToNewUser(userData, stream) {
        const { userId } = userData;
        const call = this.myPeer.call(userId, stream, { metadata: { id: this.myID } });
        call.on('stream', (userVideoStream) => {
            this.createVideo({ id: userId, stream: userVideoStream, userData });
        });
        call.on('close', () => {
            console.log('closing new user', userId);
            this.removeVideo(userId);
        });
        call.on('error', () => {
            console.log('peer error ------')
            this.removeVideo(userId);
        })
        peers[userId] = call;
    }

    boradcastMessage = (message) => {
        this.message.push(message);
        this.settings.updateInstance('message', this.message);
        this.socket.emit('broadcast-message', message);
    }

    createVideo = (createObj) => {
        if (!this.videoContainer[createObj.id]) {
            this.videoContainer[createObj.id] = {
                ...createObj,
            };
            const roomContainer = document.getElementById('room-container');
            const videoContainer = document.createElement('div');
            const video = document.createElement('video');
            video.srcObject = this.videoContainer[createObj.id].stream;
            videoContainer.id = createObj.id + "_container";
            video.id = createObj.id;
            video.autoplay = true;
            if (this.myID === createObj.id) video.muted = true;
            videoContainer.appendChild(video)
            roomContainer.append(videoContainer);
        } else {
            document.getElementById(createObj.id).srcObject = createObj.stream;
        }
    }

    reInitializeStream = (video, audio, type='userMedia') => {
        // @ts-ignore
        const media = type === 'userMedia' ? this.getVideoAudioStream(video, audio) : navigator.mediaDevices.getDisplayMedia();
        return new Promise((resolve) => {
            media.then((stream) => {
                // @ts-ignore
                const myVideo = this.getMyVideo();
                if (type === 'displayMedia') {
                    this.toggleVideoTrack({audio, video});
                    this.listenToEndStream(stream, {video, audio});
                    this.socket.emit('display-media', true);
                }
                checkAndAddClass(myVideo, type);
                this.createVideo({ id: this.myID, stream });
                replaceStream(stream);
                resolve(true);
            });
        });
    }
    
    removeVideo = (id) => {
        console.log("removing video: " + id);
        const video = document.getElementById(id + "_container");
        console.log(video)
        if (video) video.remove();
        delete this.videoContainer.id;
    }

    destoryConnection = () => {
        const myMediaTracks = this.videoContainer[this.myID]?.stream.getTracks();
        myMediaTracks?.forEach((track) => {
            track.stop();
        })
        socketInstance?.socket.disconnect();
        this.myPeer.destroy();
    }

    getMyVideo = (id=this.myID) => {
        return document.getElementById(id);
    }

    listenToEndStream = (stream, status) => {
        const videoTrack = stream.getVideoTracks();
        if (videoTrack[0]) {
            videoTrack[0].onended = () => {
                this.socket.emit('display-media', false);
                this.reInitializeStream(status.video, status.audio, 'userMedia');
                this.settings.updateInstance('displayStream', false);
                this.toggleVideoTrack(status);
            }
        }
    };

    toggleVideoTrack = (status) => {
        const myVideo = this.getMyVideo();
        // @ts-ignore
        if (myVideo && !status.video) myVideo.srcObject?.getVideoTracks().forEach((track) => {
            if (track.kind === 'video') {
                !status.video && track.stop();
            }
        });
        else if (myVideo) {
            this.reInitializeStream(status.video, status.audio);
        }
    }

    toggleAudioTrack = (status) => {
        const myVideo = this.getMyVideo();
        // @ts-ignore
        if (myVideo) myVideo.srcObject?.getAudioTracks().forEach((track) => {
            if (track.kind === 'audio')
                track.enabled = status.audio;
                status.audio ? this.reInitializeStream(status.video, status.audio) : track.stop();
        });
    }

}

const initializePeerConnection = () => {
    return new Peer (undefined, { host: 'localhost', secure: false, port: 9000, path: '/peer' });
}

const initializeSocketConnection = () => {
    return io.connect('http://localhost:4193/', {
        secure: true, 
        reconnection: true, 
        rejectUnauthorized: false,
        reconnectionAttempts: 10
    });
}

const replaceStream = (mediaStream) => {
    Object.values(peers).map((peer) => {
        peer.peerConnection?.getSenders().map((sender) => {
            if(sender.track.kind == "audio") {
                if(mediaStream.getAudioTracks().length > 0){
                    sender.replaceTrack(mediaStream.getAudioTracks()[0]);
                }
            }
            if(sender.track.kind == "video") {
                if(mediaStream.getVideoTracks().length > 0){
                    sender.replaceTrack(mediaStream.getVideoTracks()[0]);
                }
            }
        });
    })
}

const checkAndAddClass = (video, type='userMedia') => {
    if (video?.classList?.length === 0 && type === 'displayMedia')  
        video.classList.add('display-media');
    else 
        video.classList.remove('display-media');
}

const changeMediaView = (userId, status) => {
    const userVideoDOM = document.getElementById(userId);
    if (status) {
        const clientPosition = userVideoDOM.getBoundingClientRect();
        const createdCanvas = document.createElement("SPAN");
        createdCanvas.className = userId;
        createdCanvas.style.position = 'absolute';
        createdCanvas.style.left = `${clientPosition.left}px`;
        createdCanvas.style.top = `${clientPosition.top}px`;
        // createdCanvas.style.width = `${userVideoDOM.videoWidth}px`;
        // createdCanvas.style.height = `${clientPosition.height}px`;
        createdCanvas.style.width = '100%';
        createdCanvas.style.height = '100%';
        createdCanvas.style.backgroundColor = 'green';
        userVideoDOM.parentElement.appendChild(createdCanvas);
    } else {
        const canvasElement = document.getElementsByClassName(userId);
        if (canvasElement[0]) canvasElement[0].remove();
    }
}

export function createSocketConnectionInstance(settings={}) {
    return socketInstance = new SocketConnection(settings);
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

