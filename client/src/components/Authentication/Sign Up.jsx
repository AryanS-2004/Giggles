import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    position,
    useToast,
    VStack
} from "@chakra-ui/react";
import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function SignUp() {

    const [show, setShow] = useState(false);

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [pic, setPic] = useState();

    const [Loading, setLoading] = useState(false);

    const toast = useToast();

    const navigate = useNavigate();

    const handleClick = () => {
        setShow(!show);
    };

    const postDetails = (pics) => {
        console.log(pics);
        setLoading(true);
        if (pics === undefined) {
            console.log("Fucked Up!");
            toast({
                title: "Please select an image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            return;
        }
        console.log(pics);
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", 'Giggles');
            data.append('cloud_name', 'dzxq122v8');
            fetch("https://api.cloudinary.com/v1_1/dzxq122v8/image/upload", {
                method: 'POST',
                body: data
            }).then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                })
        } else {
            toast({
                title: "Please select an image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
        }
    }

    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: "Please fill all the fields!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({
                title: "Passwords don't match!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                }
            }
            const response = await axios.post("http://localhost:3000/api/user/",
                {name, email, password, pic},
                config
            )
            const data = response.data;
            toast({
                title: "Registration Successful!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            navigate('/chats')
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);

        }
    }

    return (
        <>
            <VStack spacing='5px'>
                <FormControl id='first-name' isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                        placeholder="Enter your name"
                        onChange={(e) => setName(e.target.value)}
                    ></Input>
                </FormControl>
                <FormControl id='email' isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                        placeholder="Enter your email address"
                        onChange={(e) => setEmail(e.target.value)}
                    ></Input>
                </FormControl>
                <FormControl id='password' isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : "password"}
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                        ></Input>
                        <InputRightElement width='4.5rem'>
                            <Button h='1.75rem' size='sm' onClick={handleClick}>
                                {show ? "Hide" : "show"}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <FormControl id='ConfirmPassword' isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : "password"}
                            placeholder="Enter your password again"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        ></Input>
                        <InputRightElement width='4.5rem'>
                            <Button h='1.75rem' size='sm' onClick={handleClick}>
                                {show ? "Hide" : "show"}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <FormControl id='pic'>
                    <FormLabel>Upload Picture</FormLabel>
                    <Input
                        type='file'
                        p={1.5}
                        accept='image/jpeg,image/png,image/jpg'
                        onChange={(e) => postDetails(e.target.files[0])}
                    >
                    </Input>
                </FormControl>
                <Button
                    width='100%'
                    colorScheme="blue"
                    style={{marginTop: 15}}
                    onClick={submitHandler}
                    isLoading={Loading}
                >Sign Up</Button>
            </VStack>
        </>
    );
}

export default SignUp;