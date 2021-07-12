import React, { useState, useEffect } from "react";
import GenericButton from "../Components/GenericButton"
import AltButton from "../Components/AltButton"
import illus from '../Images/home_illus.svg';
import Firebase from '../config/Firebase'

export default function Home() {
    const auth = Firebase.auth()
    useEffect(() => {
		auth.onAuthStateChanged(function (user) {
            if (user) {
                window.location.href = '/home'
            }
        })
	}, []);

    const [formData, updateFormData] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    
    const login = () => {
        const { email, password } = formData
        Firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {window.location.href = '/home'})
            .catch(error => {setError(error.message); console.log(error.message)})
    }

    const register = () => {
        window.location.href = '/register'
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
                                <div style={{position: "relative", fontWeight: "bold"}}>Login</div>
                                <input name="email" onChange={changeHandler} value={formData.email} type="text" className="form-control font-20" placeholder="Email"/>
                                <input name="password" onChange={changeHandler} value={formData.password} type="password" className="form-control font-20" placeholder="Password"/>
                                <GenericButton text="Login" onClick={login}/>
                                <AltButton text="First time here? Register" onClick={register}/>
                                <div style={{position: "relative", fontSize: "15px", color: "red"}}>{error}</div>
                            </div>
                            
                        </div>
                    </div>
                </div>
			
			</div>
		</>
	);
}
