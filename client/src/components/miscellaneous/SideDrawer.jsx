import {useState} from "react";
import {
    Avatar,
    Box,
    Button, Drawer, DrawerBody, DrawerContent,
    DrawerHeader, DrawerOverlay, Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList, Spinner,
    Text,
    Tooltip, useDisclosure, useToast
} from "@chakra-ui/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import {BellIcon, ChevronDownIcon} from "@chakra-ui/icons";
import {ChatState} from "../../Context/ChatProvider.jsx";
import ProfileModal from "./ProfileModal.jsx";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading.jsx";
import UserListItem from "../User Items/UserListItem.jsx";
import {getSender} from "../Config/ChatLogics.jsx";
import NotificationBadge from "react-notification-badge/lib/components/NotificationBadge.js";
import {Effect} from "react-notification-badge";

const SideDrawer = () => {

    const [search, setSearch] = useState("");

    const [searchResult, setSearchResult] = useState();

    const [loading, setLoading] = useState();

    const [loadingChat, setLoadingChat] = useState();

    const {user, setChats, chats, selectedChat, setSelectedChat, notification, setNotification} = ChatState();

    const navigate = useNavigate();

    const {isOpen, onOpen, onClose} = useDisclosure()

    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    }
    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please enter something in the search bar!",
                duration: 5000,
                status: "warning",
                isClosable: true,
                position: "top-left"
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    authorization: `${user.token}`
                },
            };
            const {data} = await axios.get(`http://localhost:3000/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to load the search Results!",
                duration: 5000,
                status: "error",
                isClosable: true,
                position: "bottom-left"
            });
            return;
        }
    };

    const accessChat = async (userId) => {

        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    authorization: `${user.token}`
                }
            }

            const {data} = await axios.post('http://localhost:3000/api/chat', {userId}, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching the chat!",
                status: "error",
                description: error.message,
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
        }
    };

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems='center'
                width="100%"
                bg='white'
                padding="5px 10px 5px 10px"
                borderWidth='5px'
                fontFamily='Josefin Sans'
            >
                <Tooltip
                    label='Search Users to chat'
                    hasArrow
                    placement='bottom-end'
                    fontFamily='Josefin Sans'
                >
                    <Button variant="ghost" onClick={onOpen}>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <Text
                            d={{base: 'none', md: 'flex'}}
                            px='4'>
                            Search User</Text>
                    </Button>
                </Tooltip>
                <Text fontSize='4xl' fontFamily='Josefin Sans' fontWeight='600'>
                    Giggles
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count = {notification.length}
                                effect={Effect.scale}
                            />
                            <BellIcon fontSize='2xl' m={1}/>
                        </MenuButton>
                        <MenuList
                            pl={2}
                        >
                            {!notification.length && "No New Messages"}
                            {notification.map(notification =>
                            <MenuItem
                                key={notification._id}
                                onClick={() =>{
                                    setSelectedChat(notification.chat);
                                    setNotification(notification.filter((n) => n !== notification))
                                }}
                            >
                                {notification.chat.isGroupChat
                                    ?
                                    `New message in ${notification.chat.chatName}`
                                    :
                                    `New message from ${getSender(user, notification.chat.users)}`
                                }
                            </MenuItem>
                            )}

                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                            <Avatar size="sm" cursor="pointer" name={user.name}/>
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider/>
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
            >
                <DrawerOverlay/>
                <DrawerContent
                    fontFamily='Josefin Sans'
                >
                    <DrawerHeader borderBottomWidth='1px'>Search User</DrawerHeader>
                    <DrawerBody>
                        <Box
                            display="flex"
                            paddingBottom={2}
                        >
                            <Input
                                placeholder='Search by name or email'
                                marginRight={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading/>
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner marginLeft='auto' display='flex'/>}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer;