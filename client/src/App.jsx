import {Route, Routes} from "react-router-dom";
import Home from "./Pages/HomePage.jsx"
import Chats from "./Pages/ChatPage.jsx"
import './App.css'
import HomePage from "./Pages/HomePage.jsx";
import ChatPage from "./Pages/ChatPage.jsx";

function App() {
    return (
        <>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path='/chats' element={<ChatPage/>}/>
                </Routes>
            </div>
        </>
    )
}

export default App
