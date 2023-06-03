import {
    Box,
    Button, FormControl, Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Spinner, Text,
    useDisclosure, useToast
} from "@chakra-ui/react";
import {useState} from "react";
import {ChatState} from "../../Context/ChatProvider.jsx";
import axios from "axios";
import UserListItem from "../User Items/UserListItem.jsx";
import UserBadgeItem from "../User Items/UserBadgeItem.jsx";

const GroupChatModal = ({children}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();

    const [groupChatName, setGroupChatName] = useState();

    const [selectedUsers, setSelectedUsers] = useState([]);

    const [search, setSearch] = useState();

    const [searchResults, setSearchResults] = useState();

    const [loading, setLoading] = useState();

    const toast = useToast();

    const {user, chats, setChats} = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }
        try {
            setLoading(true);

            const config = {
                headers: {
                    authorization: `${user.token}`,
                }
            }

            const {data} = await axios.get(`http://localhost:3000/api/user?search=${query}`, config);
            // console.log(data);

            setLoading(false);
            setSearchResults(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the search results.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }
    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        if(selectedUsers.length <2) {
            toast({
                title: "Select at least 2 users!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        try {
            const config = {
                headers: {
                    authorization: `${user.token}`
                }
            }
            const {data} = await axios.post(
                `http://localhost:3000/api/chat/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map(user => user._id)),
                },
                config
            )
            setChats([data, ...chats]);
            setGroupChatName();
            onClose();
            toast({
                title: "New group chat created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            toast({
                title: error.message,
                description: "Failed to create group chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }
    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);

    }
    const handleDelete = (delUser) => {

        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id))
    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Josefin Sans"
                        display="flex"
                        justifyContent="center"
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody
                        display="flex"
                        flexDirection='column'
                        alignItems='center'
                        fontFamily='Josefin Sans'
                    >
                        <FormControl>
                            <Input
                                placeholder="Chat Name"
                                marginBottom={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder=" Add Users "
                                marginBottom={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box
                            width='100%'
                            display="flex"
                            flexWrap='wrap'
                        >
                            {
                                selectedUsers.map((u) =>
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleDelete(u)}
                                    />
                                )
                            }
                        </Box>
                        {
                            loading ? (
                                <Spinner display='flex'/>
                            ) : (
                                (searchResults && searchResults.length === 0) ? (
                                    <Text
                                        p={3}
                                    >Nothing found</Text>
                                ) : (
                                    searchResults?.slice(0, 4).map(user => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={
                                                () => {
                                                    handleGroup(user)
                                                }
                                            }
                                        />
                                    )))
                            )
                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button  fontFamily='Josefin Sans' colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    )
}

export default GroupChatModal;