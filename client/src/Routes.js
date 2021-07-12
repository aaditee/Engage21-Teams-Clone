import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import App from "./App";
import Room from "./Views/Room"
import Dashboard from "./Views/Dashboard"
import Register from "./Views/Register"
require('dotenv').config();

export default function Routes() {
	return (
		<Router>
			<Switch>
				<Route exact path="/">
					<App />
				</Route>
				<Route path="/:channel/room/:link">
					<Room />
				</Route>
				<Route path="/home">
					<Dashboard />
				</Route>
				<Route path="/register">
					<Register />
				</Route>
			</Switch>
		</Router>
	);
}