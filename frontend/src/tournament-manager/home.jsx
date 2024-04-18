import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Flex,
    Heading,
    SimpleGrid,
    Stack,
    Text
} from "@chakra-ui/react";
import Sidebar from "./sidebar.jsx";
import {getTournamentList} from "../api.jsx";
import {useEffect, useState} from "react";
import {FaCalendarCheck, FaCalendarDay, FaEdit, FaFileAlt, FaTrashAlt} from "react-icons/fa";
import {useOutlet, useNavigate} from "react-router-dom";

function TournamentManagerHome() {
    const [username, setUsername] = useState("");
    const [upcomingTournament, setUpcomingTournament] = useState([]);
    const [pastTournament, setPastTournament] = useState([]);

    const navigate = useNavigate();
    const outlet = useOutlet();

    useEffect( () => {
        if (!outlet) {
            getTournamentList().then((response) => {
                setUsername(response.user);
                setUpcomingTournament(response.upcoming);
                setPastTournament(response.past);
            });
        }
    }, [outlet]);

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
                        <SimpleGrid columns={3} spacing={4} p={5}>
                        {upcomingTournament.length > 0 ? (
                            upcomingTournament.map((tournament, index) => (
                                <Card maxW='sm' key={index}>
                                    <CardBody>
                                        <Stack spacing='3'>
                                            <Heading size='md'>{tournament.name}</Heading>
                                            <Text>
                                                <Text as='b'>Start Time: </Text>{tournament.start_date} <br/>
                                                <Text as='b'>End Time: </Text>{tournament.end_date}
                                            </Text>
                                        </Stack>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter
                                        justify='space-between'
                                        flexWrap='wrap'
                                        sx={{
                                            '& > button': {
                                                minW: '136px',
                                            },
                                        }}
                                    >
                                        <Button flex='1' variant='ghost' leftIcon={<FaEdit />}>
                                            Edit
                                        </Button>
                                        <Button flex='1' variant='ghost' leftIcon={<FaTrashAlt />}>
                                            Delete
                                        </Button>
                                        <Button flex='1' variant='ghost' leftIcon={<FaFileAlt />}>
                                            Open
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <Text color="gray.500" ml={9}>No upcoming tournaments</Text>
                        )}
                        </SimpleGrid>
                        <Flex align="center" mb={4} ml={6} mt={4}>
                            <FaCalendarDay/>
                            <Heading size="md" ml={2}>Past Tournaments</Heading>
                        </Flex>
                        <SimpleGrid columns={3} spacing={4} p={5}>
                        {pastTournament.length > 0 ? (
                            pastTournament.map((tournament, index) => (
                                <Card maxW='sm' key={index}>
                                    <CardBody>
                                        <Stack spacing='3'>
                                            <Heading size='md'>{tournament.name}</Heading>
                                            <Text>
                                                <Text as='b'>Start Time: </Text>{tournament.start_date} <br/>
                                                <Text as='b'>End Time: </Text>{tournament.end_date}
                                            </Text>
                                        </Stack>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter
                                        justify='space-between'
                                        flexWrap='wrap'
                                        sx={{
                                            '& > button': {
                                                minW: '136px',
                                            },
                                        }}
                                    >
                                        <Button flex='1' variant='ghost' leftIcon={<FaEdit />}>
                                            Edit
                                        </Button>
                                        <Button flex='1' variant='ghost' leftIcon={<FaTrashAlt />}>
                                            Delete
                                        </Button>
                                        <Button flex='1' variant='ghost' leftIcon={<FaFileAlt />}>
                                            Open
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <Text color="gray.500" ml={9}>No past tournaments</Text>
                        )}
                        </SimpleGrid>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default TournamentManagerHome;