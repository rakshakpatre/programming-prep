import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StrictMode } from 'react' ;
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";


// Import your Publishable Key
const PUBLISHABLE_KEY = "pk_test_dW5pdGVkLWdvcmlsbGEtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA";


if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
        <App />
  </StrictMode>,
);
reportWebVitals();
