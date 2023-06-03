import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Router} from 'react-router-dom'
import {ChakraProvider} from "@chakra-ui/react";
import App from "./App.jsx";
import ChatProvider from "./Context/ChatProvider.jsx";


ReactDOM.createRoot(document.getElementById('root')).render(
    // <ChatProvider>
    <React.StrictMode>
        <BrowserRouter>
            <ChakraProvider>
                <ChatProvider>
                    <App/>
                </ChatProvider>
            </ChakraProvider>
        </BrowserRouter>
    </React.StrictMode>,
    // </ChatProvider>
)
