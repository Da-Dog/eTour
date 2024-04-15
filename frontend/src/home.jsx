import {Box, Button, Center, Container, Heading, Link, VStack, Image} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const handleNewPlayer = () => {
        navigate('/tournaments');
    };

    const handleExistingPlayer = () => {
        navigate('/player');
    };

    const handleHostLogin = () => {
        navigate('/login');
    };

    return (
        <Container>
            <Center h="90vh">
                <Box shadow="lg" p="6" rounded="md" bg="white">
                    <Center>
                        <Image src="/logo.png" alt="Logo" mb="3" boxSize='150px' />
                    </Center>
                    <Center>
                        <Heading as="h1" size="lg" mb="5">Welcome to E-Tournament!</Heading>
                    </Center>
                    <VStack spacing="5">
                        <Button colorScheme="teal" onClick={handleNewPlayer}>New Player? Pick a Tournament</Button>
                        <Button colorScheme="blue" onClick={handleExistingPlayer}>Existing Player? Enter Your ID to Sign In</Button>
                        <Link onClick={handleHostLogin}>Are you a host? Login here</Link>
                    </VStack>
                </Box>
            </Center>
        </Container>
    );
}

export default Home;