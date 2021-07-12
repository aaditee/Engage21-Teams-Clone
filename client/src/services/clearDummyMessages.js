import Firebase from "../config/Firebase"

const firestore = Firebase.firestore()
const sender1 = "AB6iD9mV64MUMRYW38LL5qNsDNi2";
const sender2 = "37fc1mHfS5Zx0i4WWHzr9MxQVe23";
const channel = "v3b8VZDEwo8GKbiTjFil"

const clearAllMessages = () => {
    firestore.collection("messages").where("sender", "==", sender2).get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            doc.ref.delete();
        });
    });
    firestore.collection("messages").where("sender", "==", sender1).get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            doc.ref.delete();
        });
    });
}

clearAllMessages()