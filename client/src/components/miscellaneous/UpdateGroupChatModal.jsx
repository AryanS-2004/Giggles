import {
    Box,
    Button, FormControl, IconButton, Input,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Spinner,
    useDisclosure, useToast
} from "@chakra-ui/react";
import {ViewIcon} from "@chakra-ui/icons";
import {ChatState} from "../../Context/ChatProvider.jsx";
import {useState} from "react";
import UserBadgeItem from "../User Items/UserBadgeItem.jsx";
import axios from "axios";
import UserListItem from "../User Items/UserListItem.jsx";

const UpdateGroupChatModal = ({fetchAgain, setFetchAgain, fetchMessages}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();

    const [groupChatName, setGroupChatName] = useState("");

    const [search, setSearch] = useState();

    const [searchResult, setSearchResult] = useState();

    const [loading, setLoading] = useState(false);

    const [renameLoading, setRenameLoading] = useState(false);

    const {user, selectedChat, setSelectedChat} = ChatState();

    const toast = useToast();


    const handleRemove = async (removeUser) => {
        if (selectedChat.groupAdmin._id !== user._id && removeUser._id !== user._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    authorization: `${user.token}`,
                },
            };
            const { data } = await axios.put(
                `http://localhost:3000/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: removeUser._id,
                },
                config
            );

            removeUser._id === user._id ?(selectedChat.users=[]) : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    }
    const handleAddUser = async (addUser) => {
        if (selectedChat.users.find((u) => u._id === addUser._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    authorization: `${user.token}`,
                }
            }

            const {data} = await axios.put(`http://localhost:3000/api/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: addUser._id
                },
                config
            );
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to add user.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }

    }
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

            const {data} = await axios.get(`http://localhost:3000/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
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
    const handleRename = async () => {
        if (groupChatName === "") {
            toast({
                title: "Please enter something!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    authorization: `${user.token}`
                }
            }
            console.log(config);

            const {data} = await axios.put(
                "http://localhost:3000/api/chat/rename",
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName
                },
                config
            )

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            setRenameLoading(false);
            setGroupChatName("")
        }
    }

    return (
        <>
            <IconButton
                display='flex'
                icon={<ViewIcon/>}
                onClick={onOpen}
            />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Josefin Sans"
                        display="flex"
                        justifyContent="center"
                    >{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody
                        fontFamily='Josefin Sans'
                    >
                        <Box
                            w="100%"
                            display="flex"
                            flexWrap="wrap"
                            pb={3}


                        >
                            {
                                selectedChat.users.map((u) =>
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleRemove(u)}
                                    />
                                )
                            }
                        </Box>
                        <FormControl display="flex">
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameLoading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {
                            loading ? (
                                <Spinner size="lg"/>
                            ) : (
                                searchResult?.map((u) =>
                                    <UserListItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleAddUser(u)}
                                    />
                                )
                            )

                        }
                    </ModalBody>

                    <ModalFooter
                        fontFamily = 'Josefin Sans'
                    >
                        <Button onClick={() => handleRemove(user)} colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )


}

export default UpdateGroupChatModal;