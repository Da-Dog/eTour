import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    Flex,
    Heading,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import {
    FaCalendarAlt,
    FaCalendarCheck,
    FaCalendarDay,
    FaClock, FaEdit,
    FaFileSignature,
    FaPlane, FaSquare, FaUserFriends
} from "react-icons/fa";

function Dashboard() {
    const [entries, setEntries] = useState(0);
    const [matches, setMatches] = useState(0);
    const [events, setEvents] = useState(0);
    const [days, setDays] = useState(0);
    const [scheduledMatches, setScheduledMatches] = useState("0%");
    const [completedMatches, setCompletedMatches] = useState("0%");
    const [courtStatus, setCourtStatus] = useState([]);

    const { id } = useParams();
    const navigate = useNavigate();

    const data = [
        { title: 'Entries', stat: entries.toString(), icon: <FaFileSignature size={'3em'} /> },
        { title: 'Days', stat: days.toString(), icon: <FaPlane size={'3em'} /> },
        { title: 'Events', stat: events.toString(), icon: <FaClock size={'3em'} /> },
        { title: 'Matches', stat: matches.toString(), icon: <FaCalendarAlt size={'3em'} /> },
        { title: 'Scheduled Matches', stat: scheduledMatches.toString(), icon: <FaCalendarDay size={'3em'} /> },
        { title: 'Completed Matches', stat: completedMatches.toString(), icon: <FaCalendarCheck size={'3em'} /> },
    ];

    useEffect(() => {
        // Fetch data from backend here and update the state variables.
        setCourtStatus([
            {
                number: 1,
                status: 'occupied',
                startTime: new Date('2024-04-19T15:22:00'),
                matchNumber: 1
            },
            {
                number: 2,
                status: 'free',
                startTime: null,
                matchNumber: null
            }
        ]);

        const interval = setInterval(() => {
            setCourtStatus(courtStatus => courtStatus.map(court => {
                if (court.startTime) {
                    const now = new Date();
                    const diff = now - court.startTime;
                    const seconds = Math.floor(diff / 1000);
                    const minutes = Math.floor(seconds / 60);
                    const hours = Math.floor(minutes / 60);

                    let duration;
                    if (hours > 0) {
                        duration = `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
                    } else {
                        duration = `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
                    }

                    return {...court, duration};
                } else {
                    return {...court, duration: '00:00'};
                }
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box p={5}>
            <Flex justifyContent="space-between" alignItems="center" mb={4} p={5}>
                <Heading ml={6} mt={2}>Dashboard - {/* Tournament Name */}</Heading>
                <Button colorScheme="teal" onClick={() => {navigate("/tm/" + id + "/edit")}} leftIcon={<FaEdit />}>
                    Edit Tournament
                </Button>
            </Flex>
            <SimpleGrid columns={3} spacing={5} mb={3}>
                {data.map((item, index) => (
                    <Stat
                        key={index}
                        px={{ base: 2, md: 4 }}
                        py={'5'}
                        border={'1px solid'}
                        borderColor={useColorModeValue('gray.800', 'gray.500')}
                        rounded={'lg'}>
                        <Flex justifyContent={'space-between'}>
                            <Box pl={{ base: 2, md: 4 }}>
                                <StatLabel fontWeight={'medium'} isTruncated>
                                    {item.title}
                                </StatLabel>
                                <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
                                    {item.stat}
                                </StatNumber>
                            </Box>
                            <Box
                                my={'auto'}
                                color={useColorModeValue('gray.800', 'gray.200')}
                                alignContent={'center'}>
                                {item.icon}
                            </Box>
                        </Flex>
                    </Stat>
                ))}
            </SimpleGrid>
            <Text fontSize='xl' as='b' ml={3}>Court Status</Text>
            <SimpleGrid columns={3} spacing={5} mt={3}>
                {courtStatus.map((court, index) => (
                    <Stat
                        key={index}
                        px={{ base: 2, md: 4 }}
                        py={'5'}
                        border={'1px solid'}
                        borderColor={useColorModeValue('gray.800', 'gray.500')}
                        rounded={'lg'}>
                        <Flex justifyContent={'space-between'}>
                            <Box pl={{ base: 2, md: 4 }}>
                                <StatLabel fontWeight={'medium'} isTruncated>
                                    Court {court.number}
                                </StatLabel>
                                <StatNumber fontSize={'2xl'} fontWeight={'medium'} textTransform={'capitalize'}>
                                    {court.status}
                                </StatNumber>
                                <StatNumber fontSize={'1xl'} fontWeight={'medium'}>
                                    {court.duration && court.duration !== "00:00" ? `${court.duration} - Match #${court.matchNumber}` : ''}
                                </StatNumber>
                            </Box>
                            <Box
                                my={'auto'}
                                color={useColorModeValue('gray.800', 'gray.200')}
                                alignContent={'center'}>
                                {court.status === 'occupied' ? <FaUserFriends size={'3em'} /> : <FaSquare size={'3em'} />}
                            </Box>
                        </Flex>
                    </Stat>
                ))}
            </SimpleGrid>
        </Box>
    );
}

export default Dashboard;