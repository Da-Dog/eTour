import {useState, useEffect} from 'react';
import {
    Box,
    Button,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    Heading,
    useDisclosure,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    VStack,
    FormControl,
    FormLabel,
    DrawerFooter, Drawer, Checkbox, Select, FormHelperText
} from "@chakra-ui/react";
import {FaPlus} from "react-icons/fa";
import {addEvent, getEvents} from "../api.jsx";
import {useNavigate, useParams} from "react-router-dom";

function Events() {
    const [events, setEvents] = useState([]);
    const [event, setEvent] = useState({
        name: '',
        type: 'S',
        gender: 'M',
        fee: '',
        max_entry: 0,
        scoring_format: 'S',
        arrangement: 'E',
        playoff: true,
        consolation: 'N',
        full_feed_last_round: '',
    });
    const [search, setSearch] = useState('');
    const {isOpen, onOpen, onClose} = useDisclosure()

    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = () => {
        getEvents(id).then((response) => {
            if (response) {
                setEvents(response);
            }
        });
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleSubmit = () => {
        if (event.name === '') {
            alert('Please enter event name');
            return;
        } else if (event.fee === '') {
            alert('Please enter event fee');
            return;
        } else if (event.max_entry === '') {
            alert('Please enter max entry');
            return;
        }
        addEvent(id, event).then((response) => {
            if (response.error) {
                alert(response.error);
            } else {
                onClose();
                setEvents([...events, {
                    id: response.id,
                    name: event.name,
                    type: event.type,
                    gender: event.gender,
                    fee: parseFloat(event.fee).toFixed(2),
                    max_entry: event.max_entry === 0 ? 'No Limit' : event.max_entry,
                    draw_status: "Pending"
                }]);
            }
        });
    };

    const handleOpen = () => {
        setEvent({
            name: '',
            type: 'S',
            gender: 'M',
            fee: '',
            max_entry: 0,
            scoring_format: 'S',
            arrangement: 'E',
            playoff: true,
            consolation: 'N',
            full_feed_last_round: '',
        })
        onOpen();
    }

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEvent({
            ...event,
            [e.target.name]: value
        });
    }

    return (
        <Box p={5}>
            <Drawer
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
            >
                <DrawerOverlay/>
                <DrawerContent>
                    <DrawerCloseButton/>
                    <DrawerHeader>New Event</DrawerHeader>

                    <DrawerBody>
                        <VStack spacing={3}>
                            <FormControl>
                                <FormLabel>Event Name</FormLabel>
                                <Input name='name' value={event.name} onChange={handleInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Gender</FormLabel>
                                <Select name='gender' value={event.gender} onChange={handleInputChange}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Fee</FormLabel>
                                <Input type={'number'} name='fee' value={event.fee} onChange={handleInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Type</FormLabel>
                                <Select name='type' value={event.type} onChange={handleInputChange}>
                                    <option value="S">Single</option>
                                    <option value="D">Double</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Scoring Format</FormLabel>
                                <Select name='scoring_format' value={event.scoring_format} onChange={handleInputChange}>
                                    <option value="S">Standard</option>
                                    <option value="O">One Set</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Arrangement</FormLabel>
                                <Select name='arrangement' value={event.arrangement} onChange={handleInputChange}>
                                    <option value="E">Elimination</option>
                                    <option value="R">Round Robin</option>
                                    <option value="EC">Elimination Consolation</option>
                                    <option value="RP">Round Robin Playoff</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Consolation</FormLabel>
                                <Select name='consolation' value={event.consolation} onChange={handleInputChange}>
                                    <option value="N">None</option>
                                    <option value="FR">First Round</option>
                                    <option value="FM">First Match</option>
                                    <option value="FF">Full Feed</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Playoff</FormLabel>
                                <Checkbox name='playoff' isChecked={event.playoff} onChange={handleInputChange}/>
                            </FormControl>
                            {event.consolation === 'FF' && (
                                <FormControl>
                                    <FormLabel>Full Feed Last Round</FormLabel>
                                    <Select name='full_feed_last_round' value={event.full_feed_last_round}
                                            onChange={handleInputChange}>
                                        <option value="F">Final</option>
                                        <option value="S">Semi</option>
                                        <option value="Q">Quarter</option>
                                        <option value="16">16th</option>
                                        <option value="32">32nd</option>
                                        <option value="64">64th</option>
                                    </Select>
                                </FormControl>
                            )}
                            <FormControl>
                                <FormLabel>Max Entry</FormLabel>
                                <Input type={'number'} name='max_entry' value={event.max_entry}
                                       onChange={handleInputChange}/>
                                <FormHelperText>0 for unlimited entry</FormHelperText>
                            </FormControl>
                        </VStack>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant='outline' mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Save
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Flex justifyContent="space-between" alignItems="center" mb={4} p={5}>
                <Heading ml={6} mt={2}>Events</Heading>
                <Box w={'40%'}>
                    <Input placeholder="Search events" value={search} onChange={handleSearch}/>
                </Box>
                <Button colorScheme="teal" leftIcon={<FaPlus/>} onClick={handleOpen}>
                    Add Event
                </Button>
            </Flex>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th>Gender</Th>
                        <Th>Fee</Th>
                        <Th>Max Entry</Th>
                        <Th>Draw Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {events.filter(event => event.name.toLowerCase().includes(search.toLowerCase())).map((event, index) => (
                        <Tr key={index}  _hover={{ backgroundColor: 'gray.200' }} style={{cursor: "pointer"}} onClick={() => navigate("/tm/" + id + "/event/" + event.id)}>
                            <Td>{event.name}</Td>
                            <Td>{event.type === 'S' ? "Single" : "Double"}</Td>
                            <Td>{event.gender === 'M' ? 'Male' : 'Female'}</Td>
                            <Td>{event.fee}</Td>
                            <Td>{event.max_entry}</Td>
                            <Td>{event.draw_status}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

export default Events;