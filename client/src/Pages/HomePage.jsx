import {Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from "@chakra-ui/react";
import Login from "../components/Authentication/Login.jsx";
import SignUp from "../components/Authentication/Sign Up.jsx";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";


function HomePage() {
    const navigate = useNavigate();


    useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if(user){
        navigate('/chats')
    }
    }, [navigate]);
    return (
        <>
            <Container maxW = 'xl' centerContent>
                <Box
                    d="flex"
                    textAlign='center'
                    p={3}
                    bg = 'white'
                    width = '100%'
                    m = '40px 0 15px 0'
                    borderRadius = 'lg'
                    borderWidth = '1px'
                >
                    <Text fontSize = '4xl' fontFamily='Josefin Sans' >
                        Giggles
                    </Text>
                </Box>
                <Box
                    p={4}
                    bg = 'white'
                    width = '100%'
                    borderRadius = 'lg'
                    borderWidth = '1px'
                >
                    <Tabs variant='soft-rounded'>
                        <TabList mb='1em'>
                            <Tab width='50%'>Login</Tab>
                            <Tab width='50%'>Sign Up</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Login/>
                            </TabPanel>
                            <TabPanel>
                                <SignUp/>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Container>
        </>
    )
}

export default HomePage