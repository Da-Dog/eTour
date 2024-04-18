import {Box, Button, Center, Container, FormControl, FormLabel, FormErrorMessage, Heading, Image, Input, VStack} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {login, refresh} from "./api.jsx";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({email: false, password: false});
    const [loginState, setLoginState] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        refresh().then(success => {
            if (success) {
                alert("You are already logged in, redirecting to tournament manager.");
                navigate('/tm');
            }
        });
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        if(email.trim() === '' || password.trim() === '') {
            alert('All fields are required');
            return;
        }
        setLoginState(true);
        login(email, password).then(() => {
            setTimeout(() => {
                navigate('/tm');
            }, 1000);
        });
    };

    const handleBlur = (field) => {
        setTouched({...touched, [field]: true});
    }

    return (
        <Container>
            <Center h="90vh">
                <Box shadow="lg" p="5" rounded="md" bg="white" w="100%">
                    <Center>
                        <Image src="/logo.png" alt="Logo" mb="3" boxSize='150px'/>
                    </Center>
                    <Center>
                        <Heading as="h1" size="lg" mb="5">Host Login</Heading>
                    </Center>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing="5">
                            <FormControl id="email" isInvalid={touched.email && email.trim() === ''}>
                                <FormLabel>Email address</FormLabel>
                                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur('email')}/>
                                <FormErrorMessage>Email is required</FormErrorMessage>
                            </FormControl>
                            <FormControl id="password" isInvalid={touched.password && password.trim() === ''}>
                                <FormLabel>Password</FormLabel>
                                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} onBlur={() => handleBlur('password')}/>
                                <FormErrorMessage>Password is required</FormErrorMessage>
                            </FormControl>
                            <Button colorScheme="blue" w="60%" type="submit" isLoading={loginState}>Login</Button>
                        </VStack>
                    </form>
                </Box>
            </Center>
        </Container>
    );
}

export default Login;