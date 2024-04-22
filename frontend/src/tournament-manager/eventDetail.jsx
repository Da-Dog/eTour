import {
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Tab,
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import {FaPlus, FaRandom} from "react-icons/fa";
import {useState} from "react";

import TeamInput from "./teamInputField.jsx";

function EventDetail() {
    const {id, event_id} = useParams();
    const [events, setEvents] = useState([]);
    const [entries, setEntries] = useState([
        {
            entry_id: 1,
            player: 'John Doe',
            partner: 'Jane Doe',
            seeding: 'A1',
        },
        {
            entry_id: 2,
            player: 'James Smith',
            partner: 'Jessica Smith',
            seeding: 'B1',
        },
        {
            entry_id: 3,
            player: 'Robert Johnson',
            partner: 'Rebecca Johnson',
            seeding: 'C1',
        },
        {
            entry_id: 4,
            player: 'Michael Williams',
            partner: 'Michelle Williams',
            seeding: 'D1',
        },
        {
            entry_id: 5,
            player: 'David Brown',
            partner: 'Diana Brown',
            seeding: 'E1',
        },
    ]);
    const [matches, setMatches] = useState([]);
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
    const [entry, setEntry] = useState({
        entry_id: 0,
        player: '',
        partner: '',
        seeding: '',
    });
    const [match, setMatch] = useState({
        match_id: 0,
        match: '',
        round: 'A',
        court: '',
        team1: '',
        team2: '',
        score1: '',
        score2: '',
        score3: '',
        score4: '',
        score5: '',
        score6: '',
        scheduled_time: '',
        note: '',
        no_match: false,
    });

    const [tabIndex, setTabIndex] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isMatchOpen, onOpen: onMatchOpen, onClose: onMatchClose } = useDisclosure();

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEvent({
            ...event,
            [e.target.name]: value
        });
    }

    const handleMatchInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setMatch({
            ...match,
            [e.target.name]: value
        });
    }

    const handleDeleteConfirm = () => {
        console.log('delete');
        // Call api to delete
    }

    return (
        <Box p={5}>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete this event?
                        <br/><br/>
                        Events with entries can not be deleted, if you want to delete this event, please delete all entries first.
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="ghost" colorScheme="red" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isMatchOpen} onClose={onMatchClose} size='lg'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Match - {match.match ? match.match : "New"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={3}>
                            <FormControl>
                                <FormLabel>Match</FormLabel>
                                <Input type='number' name='match' value={match.match} onChange={handleMatchInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Round</FormLabel>
                                <Select name='type' value={match.round} onChange={handleMatchInputChange}>
                                    <option value="A">Additional</option>
                                    <option value="F">Final</option>
                                    <option value="SF">Semi Final</option>
                                    <option value="QF">Quarter Final</option>
                                    <option value="16">Round 16</option>
                                    <option value="32">Round 32</option>
                                    <option value="64">Round 64</option>
                                    <option value="128">Round 128</option>
                                    <option value="256">Round 256</option>
                                    <option value="512">Round 512</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Court</FormLabel>
                                <Input type='number' name='court' value={match.court} onChange={handleMatchInputChange}/>
                            </FormControl>
                            <TeamInput team='team1' match={match} setMatch={setMatch} entries={entries} />
                            <TeamInput team='team2' match={match} setMatch={setMatch} entries={entries} />
                            <FormControl>
                                <FormLabel>Score</FormLabel>
                                <Flex>
                                    <Input type='number' name='score1' value={match.score1} onChange={handleMatchInputChange} width="20%" mr={1}/>
                                    <Text mt={1}>-</Text>
                                    <Input type='number' name='score2' value={match.score2} onChange={handleMatchInputChange} width="20%" ml={1} mr={3}/>
                                    <Input type='number' name='score3' value={match.score3} onChange={handleMatchInputChange} width="20%" mr={1}/>
                                    <Text mt={1}>-</Text>
                                    <Input type='number' name='score4' value={match.score4} onChange={handleMatchInputChange} width="20%" ml={1} mr={3}/>
                                    <Input type='number' name='score5' value={match.score5} onChange={handleMatchInputChange} width="20%" mr={1}/>
                                    <Text mt={1}>-</Text>
                                    <Input type='number' name='score6' value={match.score6} onChange={handleMatchInputChange} width="20%" ml={1}/>
                                </Flex>
                                <FormHelperText>Enter team 1 score then team 2 score</FormHelperText>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Scheduled Time</FormLabel>
                                <Input type='datetime-local' name='scheduled_time' value={match.scheduled_time} onChange={handleMatchInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Note</FormLabel>
                                <Textarea name='note' value={match.note} onChange={handleMatchInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>No Match</FormLabel>
                                <Checkbox name='no_match' isChecked={match.no_match} onChange={handleMatchInputChange}/>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onMatchClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue">
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Flex justifyContent="space-between" alignItems="center" mb={4} p={5}>
                <Heading ml={6} mt={2}  w={'75%'} isTruncated>Event Detail - {event.name}</Heading>
                {tabIndex === 1 ?
                    <Button colorScheme="teal" leftIcon={<FaPlus/>}>
                        Add Entry
                    </Button> : <></>
                }
                {tabIndex === 2 ?
                    <Button colorScheme="teal" leftIcon={<FaRandom/>}>
                        Auto Draw
                    </Button> : <></>
                }
                {tabIndex === 3 ?
                    <Button colorScheme="teal" leftIcon={<FaPlus/>} onClick={onMatchOpen}>
                        New Match
                    </Button> : <></>
                }
            </Flex>

            <Tabs variant='soft-rounded' colorScheme='blue' onChange={(index) => setTabIndex(index)} isFitted>
                <TabList>
                    <Tab>Info</Tab>
                    <Tab>Entry</Tab>
                    <Tab>Draw</Tab>
                    <Tab>Match</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <VStack spacing={3}>
                            <FormControl>
                                <FormLabel>Name</FormLabel>
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
                        <Box mt={5}>
                            <Button variant='outline' mr={3}>
                                Reset
                            </Button>
                            <Button colorScheme='blue'>
                                Save
                            </Button>
                            <Button colorScheme='red' float='right' onClick={onOpen}>
                                Delete Event
                            </Button>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Team</Th>
                                    <Th>Seeding</Th>
                                    <Th>Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>

                            </Tbody>
                        </Table>
                    </TabPanel>
                    <TabPanel>

                    </TabPanel>
                    <TabPanel>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Time</Th>
                                    <Th>Team 1</Th>
                                    <Th>Team 2</Th>
                                    <Th>Score</Th>
                                    <Th>Duration</Th>
                                    <Th>Court</Th>
                                </Tr>
                            </Thead>
                            <Tbody>

                            </Tbody>
                        </Table>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default EventDetail;