import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Routes from "./Routes";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
window.axios = axios;

ReactDOM.render(
  <Routes/>,
  document.getElementById('root')
);

reportWebVitals();
