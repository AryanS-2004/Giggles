import {ChatState} from "../Context/ChatProvider.jsx";
import {Box, FormControl, IconButton, Input, Menu, Spinner, Text, useToast} from "@chakra-ui/react";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {getSender, getSenderFull} from "./Config/ChatLogics.jsx";
import ProfileModal from "./miscellaneous/ProfileModal.jsx";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import ScrollableChat from "./ScrollableChat.jsx";
import io from "socket.io-client"

const ENDPOINT = "http://localhost:3000";
let socket , selectedChatCompare;


const SingleChat = ({fetchAgain, setFetchAgain}) => {


    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);

    const [newMessage, setNewMessage] = useState("");

    const [socketConnected, setSocketConnected] = useState(false);

    const [typing, setTyping] = useState(false);

    const [isTyping, setIsTyping] = useState(false);

    const {user, selectedChat, setSelectedChat, notification, setNotification} = ChatState();

    const toast = useToast();





    const fetchMessages = async() => {
        if(!selectedChat)return;
        try{
            setLoading(true);
            const config = {
                headers: {
                    authorization: `${user.token}`,
                }
            }
            const {data} = await axios.get(`http://localhost:3000/api/message/${selectedChat._id}`, config);

            setMessages(data);
            setLoading(false);
            socket.emit('join chat', selectedChat._id)
        }catch(error){
            toast({
                title: "Error Occured",
                description : error.message,
                status:'error',
                duration: 5000,
                isClosable : true,
                position: 'bottom'
            });
        }
    }
    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit('stop typing', selectedChat._id);
            try {
                const config = {
                    headers: {
                        authorization: `${user.token}`,
                        "Content-type": "application/json"
                    }
                }
                setNewMessage("")
                const {data} = await axios.post('http://localhost:3000/api/message', {
                        content: newMessage,
                        chatId: selectedChat
                    },
                    config
                )

                // console.log(data);
                socket.emit('new message', data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured",
                    description : error.message,
                    status:'error',
                    duration: 5000,
                    isClosable : true,
                    position: 'bottom'
                });
            }
        }
    };




    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true) );
        socket.on('typing', () => setIsTyping(true) );
        socket.on('stop typing', () => setIsTyping(false) );
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;

    }, [selectedChat]);
    // console.log(notification, "---------");

    useEffect(() => {
        socket.on('message recieved', (newMessageRecieved) => {
            if(!selectedChatCompare || selectedChatCompare._id != newMessageRecieved.chat._id){
                if(!notification.includes(newMessageRecieved)){
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            }
            else{
                setMessages([...messages, newMessageRecieved]);
            }
        })
    });





    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        // Typing Indicator Logic

        if(!socketConnected)return;
        if(!typing){
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        let timerLength =3000;
        setTimeout(()=>{
            let timeNow = new Date().getTime();
            let timeDeff = timeNow - lastTypingTime;
            if(timeDeff>=timerLength && typing){
                socket.emit('stop typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength)
    }

    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Text
                            fontSize={{base: "28px", md: "30px"}}
                            pb={3}
                            px={2}
                            width="100%"
                            fontFamily="Josefin Sans"
                            display="flex"
                            justifyContent={{base: "space-between"}}
                            alignItems="center"
                        >
                            <IconButton
                                display={{base: "flex", md: "none"}}
                                icon={<ArrowBackIcon/>}
                                onClick={() => setSelectedChat("")}
                            />
                            {
                                !selectedChat.isGroupChat ? (
                                    <>
                                        {getSender(user, selectedChat.users)}
                                        <ProfileModal user={getSenderFull(user, selectedChat.users)}/>
                                    </>
                                ) : (
                                    <>
                                        {selectedChat.chatName}
                                        <UpdateGroupChatModal
                                            fetchAgain={fetchAgain}
                                            setFetchAgain={setFetchAgain}
                                            fetchMessages = {fetchMessages}
                                        />

                                    </>
                                )
                            }
                        </Text>
                        <Box
                            display="flex"
                            flexDir='column'
                            justifyContent='flex-end'
                            p={3}
                            bg="#E8E8E8"
                            w="100%"
                            height="100%"
                            borderRadius='lg'
                            overflowY="hidden"
                        >
                            {
                                loading ? (
                                    <Spinner
                                        size='lg'
                                        h={20}
                                        w={20}
                                        alignSelf='center'
                                        margin='auto'
                                    />
                                ) : (
                                    <div className="messages" >
                                        <ScrollableChat messages={messages} />
                                    </div>
                                )
                            }
                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                                {isTyping ? <div>
                                    {/*<Lottie*/}
                                    {/*    options = {defaultOptions}*/}
                                    {/*    width={70}*/}
                                    {/*    style = {{*/}
                                    {/*        marginBottom: 15,*/}
                                    {/*        marginLeft: 0*/}
                                    {/*    }}*/}
                                    {/*/>*/}
                                    Typing...
                                </div> : <></>}
                                <Input
                                    fontFamily='Josefin Sans'
                                    placeholder='Enter a message....'
                                    variant="filled"
                                    bg="#E0E0E0"
                                    onChange={typingHandler}
                                    value={newMessage}

                                />

                            </FormControl>
                        </Box>
                    </>
                ) : (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                    >
                        <Text
                            fontSize="3xl"
                            pb={3}
                            fontFamily="Josefin Sans"
                        >
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )

}
export default SingleChat;