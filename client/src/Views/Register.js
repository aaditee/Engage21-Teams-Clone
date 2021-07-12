import React, { useState } from "react";
import GenericButton from "../Components/GenericButton"
import AltButton from "../Components/AltButton"
import illus from '../Images/home_illus.svg';
import Firebase from '../config/Firebase'
const axios = require("axios").default;

export default function Register() {

    const[formData, updateFormData] = useState({
        name: "",
        email: "",
        password: "",
        con_password: ""
    })
    const [error, setError] = useState("")
    const login = () => {
        window.location.href = '/login'
    }

    const register = () => {
        const { name, email, password, con_password } = formData;
        if (password !== con_password) {
            setError("Passwords don't match")
            return
        }
		Firebase.auth()
			.createUserWithEmailAndPassword(email, password)
			.then(async () => {
				const db = Firebase.firestore();
				db.settings({
					timestampsInSnapshots: true,
				});
                const userRef = await db.collection("users").doc(Firebase.auth().currentUser.uid).set({
                    email: email, 
                    name: name,
                    uid: Firebase.auth().currentUser.uid
                })
				window.location.href = "/home";

			})
			.catch((error) => setError(error.message));
    }

    const changeHandler = e => {
		const x = e.target.value;
		updateFormData({
			...formData,
			[e.target.name]: x
		})
	}

	return (
		<>
			<div className="row">
                <div className="home-column">
                    <div style={{textAlign: "center"}}>
                        <img alt="" src={illus} style={{textAlign: "center", height: "100%"}}/>
                    </div>       
                </div>
                <div className="home-column" style={{backgroundColor: "#6c63ff"}}>
                    <div className="rcorners1 box" style={{backgroundColor: "white", margin: "50px", padding: "50px", height: "100%"}}>
                        <div className="box">
                            <div style={{textAlign: "center", fontSize: "40px", height: "100%"}}>
                                <div style={{position: "relative"}}>Welcome to Teams!</div>
                                <div style={{position: "relative", fontWeight: "bold"}}>Register</div>
                                <input name="name" onChange={changeHandler} value={formData.name} type="text" className="form-control font-20" placeholder="Name"/>
                                <input name="email" onChange={changeHandler} value={formData.email} type="text" className="form-control font-20" placeholder="Email"/>
                                <input name="password" onChange={changeHandler} value={formData.password} type="password" className="form-control font-20" placeholder="Password"/>
                                <input name="con_password" onChange={changeHandler} value={formData.con_password} type="password" className="form-control font-20" placeholder="Confirm Password"/>
                                <GenericButton text="Register" onClick={register}/>
                                <AltButton text="Already have an account? Login" onClick={login}/>
                                <div style={{position: "relative", fontSize: "15px", color: "red"}}>{error}</div>
                            </div>
                        </div>
                    </div>
                </div>
			
			</div>
		</>
	);
}
