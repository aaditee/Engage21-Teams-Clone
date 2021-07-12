import Firebase from "../config/Firebase"

const firestore = Firebase.firestore()
const sender1 = "AB6iD9mV64MUMRYW38LL5qNsDNi2";
const sender2 = "37fc1mHfS5Zx0i4WWHzr9MxQVe23";
const channel = "v3b8VZDEwo8GKbiTjFil"

const sendMessage1 = async (message) => {
    await firestore.collection("messages").add({
        sender: sender1,
        channel: channel,
        time: new Date().getTime().toString(),
        senderName: "Arjun Bajpai",
        text: message
    })
}

const sendMessage2 = async (message) => {
    await firestore.collection("messages").add({
        sender: sender2,
        channel: channel,
        time: new Date().getTime().toString(),
        senderName: "notArjun Bajpai",
        text: message
    })
}

const addDummy = async () => {
    for (var i = 0; i < 10; i++) {
        await sendMessage1(i.toString())
    }
    for (var i = 0; i < 10; i++) {
        await sendMessage2(i.toString())
    }
}

addDummy();