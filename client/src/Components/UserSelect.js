import React, { useEffect, useState } from "react";
import Firebase from "../config/Firebase";
import "../Styles/dashboard.css";
import CheckIcon from '@material-ui/icons/Check';
import GenericButton from "./GenericButton"

export default function UserSelect(props) {
	const firestore = Firebase.firestore();

	const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([])
    const [search, setSearch] = useState("")

	useEffect(() => {
		loadUsers();
	}, []);

    useEffect(() => {
        
    }, [filteredUsers])

	const loadUsers = () => {
		firestore
			.collection("users")
            .where("uid", "!=", props.cuid)
			.get()
			.then((querySnapshot) => {
				const documents = querySnapshot.docs.map((doc) => ({...doc.data(), selected: false}));
                documents.sort((a, b) => (a.name > b.name) ? 1 : -1)
				setUsers(documents);
                setFilteredUsers(documents)
			});
	};

    const searchHandler = e => {
		const input = e.target.value;
		setSearch(input)
        if (input === "") {
            setFilteredUsers(users);
            return;
        }
        const filtered = users.filter(item => {
            return Object.keys(item).some(key => {
                if (typeof item[key] != "boolean")
                    return item[key].toLowerCase().includes(input.toLowerCase())
            });
        });
        filtered.sort((a, b) => (a.name > b.name) ? 1 : -1)
        setFilteredUsers(filtered);
	}

    const addToSelected = (user) => {
        const updatedList = filteredUsers.filter((item) => item.uid !== user.uid);
        user.selected = !user.selected
        updatedList.push(user)
        updatedList.sort((a, b) => (a.name > b.name) ? 1 : -1)
        setFilteredUsers(updatedList)
    }

    const onSubmit = () => {
        const selectedList = users.filter((user) => user.selected == true)
        props.onSubmit(selectedList)
        props.handleClose()
    }

	return (
		<div>
			<div className="popup-box">
				<div className="popbox">
					<span className="close-icon" onClick={props.handleClose}>
						x
					</span>
                    <div className="popup-content">
                        <div style={{fontWeight: 'bold', textAlign: 'center', width: "100%", fontSize: "30px"}}>Add Users</div>
                        <input name="search" onChange={searchHandler} value={search} type="text" className="form-control font-20 search" style={{minWidth: "100%"}} placeholder="Search"/>
                        {filteredUsers.map((i, k) => (
                            <div key={i.uid} className="channel font-20 pop" onClick={() => addToSelected(i)}>
                                <div style={{flex: "9"}}>{i.name}</div>
                                {i.selected && <CheckIcon style={{flex: "1", color: "green"}} />}
                            </div>
                        ))}
                        <GenericButton text="Add" onClick={onSubmit}/>
                    </div>
				</div>
			</div>
		</div>
	);
}
