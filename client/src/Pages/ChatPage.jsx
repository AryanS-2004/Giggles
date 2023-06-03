import {ChatState} from "../Context/ChatProvider.jsx";
import {Box} from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer.jsx";
import MyChats from "../components/MyChats.jsx";
import ChatBox from "../components/ChatBox.jsx";
import {useState} from "react";

function ChatPage() {
    const {user} = ChatState();

    const [fetchAgain, setFetchAgain] = useState(false);
    // console.log(user);

    return (
        <div style={{width : '100%'}}>
            {user && <SideDrawer/>}
            <Box
                display="flex"
                justifyContent="space-between"
                width='100%'
                h='91.5vh'
                p='10px'
            >
                {user && <MyChats fetchAgain ={ fetchAgain}/>}
                {user && <ChatBox fetchAgain ={ fetchAgain} setFetchAgain = {setFetchAgain}/>}
            </Box>
        </div>
    )
}

export default ChatPage;