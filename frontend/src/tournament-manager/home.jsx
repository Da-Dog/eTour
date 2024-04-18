import {Box, Button, Flex, Heading} from "@chakra-ui/react";
import Sidebar from "./sidebar.jsx";
import {getTournamentList} from "../api.jsx";
import {useEffect, useState} from "react";

function TournamentManagerHome() {
    const [username, setUsername] = useState("");
    const [upcomingTournament, setUpcomingTournament] = useState([]);
    const [pastTournament, setPastTournament] = useState([]);

    useEffect( () => {
        getTournamentList().then((response) => {
            setUsername(response.user);
            setUpcomingTournament(response.upcoming);
            setPastTournament(response.past);
        });
    }, []);

    return (
        <Box bg={"gray.100"} w="100%" h="100vh">
            <Box pl="250px">
                <Sidebar isSidebarDisabled={true}/>
                <Flex direction="column" p={5}>
                    <Flex justifyContent="space-between" alignItems="center" mb={4}>
                        <Heading ml={2} mt={2}>Welcome {username}!</Heading>
                        <Button colorScheme="teal">
                            + New Tournament
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </Box>
    );
}

export default TournamentManagerHome;