import {Box, Button, Flex, Heading, Text} from "@chakra-ui/react";
import Sidebar from "./sidebar.jsx";
import {getTournamentList} from "../api.jsx";
import {useEffect, useState} from "react";
import {FaCalendarCheck, FaCalendarDay} from "react-icons/fa";
import {useOutlet, useNavigate} from "react-router-dom";

function TournamentManagerHome() {
    const [username, setUsername] = useState("");
    const [upcomingTournament, setUpcomingTournament] = useState([]);
    const [pastTournament, setPastTournament] = useState([]);

    const navigate = useNavigate();
    const outlet = useOutlet();

    useEffect( () => {
        getTournamentList().then((response) => {
            setUsername(response.user);
            setUpcomingTournament(response.upcoming);
            setPastTournament(response.past);
        });
    }, []);

    return (
        <Box bg={"gray.100"} w="100%" h="100vh">
            <Box pl="250px" overflowY="auto" maxHeight="100vh">
                <Sidebar isSidebarDisabled={true}/>
                {outlet || (
                    <>
                        <Flex direction="column" p={5}>
                            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                                <Heading ml={6} mt={2}>Welcome {username}!</Heading>
                                <Button colorScheme="teal" onClick={() => {navigate("/tm/new")}}>
                                    + New Tournament
                                </Button>
                            </Flex>
                        </Flex>
                        <Flex align="center" mb={4} ml={6} mt={4}>
                            <FaCalendarCheck/>
                            <Heading size="md" ml={2}>Upcoming Tournaments</Heading>
                        </Flex>
                        {/*TODO: replace place hold with actual cards and data*/}
                        {upcomingTournament.length > 0 ? (
                            upcomingTournament.map((tournament, index) => (
                                <Box key={index} p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md" mb={4}>
                                    <Heading fontSize="xl">{tournament.name}</Heading>
                                </Box>
                            ))
                        ) : (
                            <Text color="gray.500" ml={9}>No upcoming tournaments</Text>
                        )}
                        <Flex align="center" mb={4} ml={6} mt={4}>
                            <FaCalendarDay/>
                            <Heading size="md" ml={2}>Past Tournaments</Heading>
                        </Flex>
                        {pastTournament.length > 0 ? (
                            pastTournament.map((tournament, index) => (
                                <Box key={index} p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md" mb={4}>
                                    <Heading fontSize="xl">{tournament.name}</Heading>
                                </Box>
                            ))
                        ) : (
                            <Text color="gray.500" ml={9}>No past tournaments</Text>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}

export default TournamentManagerHome;