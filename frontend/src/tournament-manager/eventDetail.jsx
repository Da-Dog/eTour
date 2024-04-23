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
    Select as ChakraSelect,
    Tab,
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody, Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import Select from "react-select";
import {useNavigate, useParams} from "react-router-dom";
import {FaPlus, FaRandom} from "react-icons/fa";
import {useEffect, useState} from "react";
import {deleteEvent, getEvent, updateEvent} from "../api.jsx";

function EventDetail() {
    const {id, event_id} = useParams();
    const [entries, setEntries] = useState([]);
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
    const { isOpen: isEntryOpen, onOpen: onEntryOpen, onClose: onEntryClose } = useDisclosure();

    const [players, setPlayers] = useState([]);
    const [entriesSelect, setEntriesSelect] = useState([]);

    const navigate = useNavigate();

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
        deleteEvent(id, event_id).then(() => {
            navigate('/tm/' + id + '/event');
        });
    }

    const handleSave = () => {
        updateEvent(id, event_id, event).then(response => {
            if (response.error) {
                alert(response.error);
            } else {
               alert('Saved');
            }
        });
    }

    useEffect(() => {
        getEvent(id, event_id).then(response => {
            setEvent({
                name: response.name,
                type: response.type,
                gender: response.gender,
                fee: response.fee,
                max_entry: response.max_entry,
                scoring_format: response.scoring_format,
                arrangement: response.arrangement,
                playoff: response.playoff,
                consolation: response.consolation,
                full_feed_last_round: response.full_feed_last_round,
            });
            setEntries(response.entries.map(entry => {
                return {
                    entry_id: entry.id,
                    player: entry.participant,
                    partner: entry.partner,
                    seeding: entry.seed,
                }
            }));
            setPlayers(response.players.map(player => {
                return {
                    value: player.id,
                    label: player.first_name + ' ' + player.last_name
                }
            }));
        });
    }, [event_id, id]);

    useEffect(() => {
        if (isMatchOpen) {
            setEntriesSelect(entries.map(entry => {
                return {
                    value: entry.entry_id,
                    label: entry.player + (entry.partner ? ' / ' + entry.partner : '')
                }
            }));
        }
    }, [isMatchOpen, entries]);

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

            <Modal isOpen={isEntryOpen} onClose={onEntryClose} size='lg'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Entry - {entry.entry_id === 0 ?  "New" : entry.entry_id}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={3}>
                            <FormControl>
                                <FormLabel>Player</FormLabel>
                                <Select
                                    name='player'
                                    value={players.find(option => option.value === entry.player)}
                                    onChange={(option) => setEntry({...entry, player: option.value})}
                                    options={players}
                                    isSearchable
                                />
                            </FormControl>
                            {event.type === 'D' ? (
                                <FormControl>
                                    <FormLabel>Partner</FormLabel>
                                    <Select
                                        name='partner'
                                        value={players.find(option => option.value === entry.partner)}
                                        onChange={(option) => setEntry({...entry, partner: option.value})}
                                        options={players}
                                        isSearchable
                                    />
                                </FormControl>
                            ): <></>}
                            <FormControl>
                                <FormLabel>Seeding</FormLabel>
                                <Input type='number' name='seeding' value={entry.seeding} onChange={(e) => setEntry({...entry, seeding: e.target.value})}/>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEntryClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue">
                            Save
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
                                <ChakraSelect name='type' value={match.round} isDisabled>
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
                                </ChakraSelect>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Court</FormLabel>
                                <Input type='number' name='court' value={match.court} onChange={handleMatchInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Team 1</FormLabel>
                                <Select
                                    name='team1'
                                    value={entriesSelect.find(option => option.value === match.team1)}
                                    onChange={(option) => setMatch({...match, team1: option.value})}
                                    options={entriesSelect}
                                    isSearchable
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Team 2</FormLabel>
                                <Select
                                    name='team2'
                                    value={entriesSelect.find(option => option.value === match.team2)}
                                    onChange={(option) => setMatch({...match, team2: option.value})}
                                    options={entriesSelect}
                                    isSearchable
                                />
                            </FormControl>
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
                    <Button colorScheme="teal" leftIcon={<FaPlus/>} onClick={onEntryOpen}>
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
                                <ChakraSelect name='gender' value={event.gender} onChange={handleInputChange}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </ChakraSelect>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Fee</FormLabel>
                                <Input type={'number'} name='fee' value={event.fee} onChange={handleInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Type</FormLabel>
                                <ChakraSelect name='type' value={event.type} onChange={handleInputChange}>
                                    <option value="S">Single</option>
                                    <option value="D">Double</option>
                                </ChakraSelect>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Scoring Format</FormLabel>
                                <ChakraSelect name='scoring_format' value={event.scoring_format} onChange={handleInputChange}>
                                    <option value="S">Standard</option>
                                    <option value="O">One Set</option>
                                </ChakraSelect>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Arrangement</FormLabel>
                                <ChakraSelect name='arrangement' value={event.arrangement} onChange={handleInputChange}>
                                    <option value="E">Elimination</option>
                                    <option value="R">Round Robin</option>
                                    <option value="EC">Elimination Consolation</option>
                                    <option value="RP">Round Robin Playoff</option>
                                </ChakraSelect>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Consolation</FormLabel>
                                <ChakraSelect name='consolation' value={event.consolation} onChange={handleInputChange}>
                                    <option value="N">None</option>
                                    <option value="FR">First Round</option>
                                    <option value="FM">First Match</option>
                                    <option value="FF">Full Feed</option>
                                </ChakraSelect>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Playoff</FormLabel>
                                <Checkbox name='playoff' isChecked={event.playoff} onChange={handleInputChange}/>
                            </FormControl>
                            {event.consolation === 'FF' && (
                                <FormControl>
                                    <FormLabel>Full Feed Last Round</FormLabel>
                                    <ChakraSelect name='full_feed_last_round' value={event.full_feed_last_round}
                                            onChange={handleInputChange}>
                                        <option value="F">Final</option>
                                        <option value="S">Semi</option>
                                        <option value="Q">Quarter</option>
                                        <option value="16">16th</option>
                                        <option value="32">32nd</option>
                                        <option value="64">64th</option>
                                    </ChakraSelect>
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
                            <Button colorScheme='blue' onClick={handleSave}>
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
                                {entries.map((entry, index) => (
                                    <Tr key={entry.entry_id}>
                                        <Th>{index + 1}</Th>
                                        <Td>
                                            <Text textTransform='capitalize'>{players.find((element) => element.value === entry.player)?.label}</Text>
                                            <Text textTransform='capitalize'>{entry.partner ? players.find((element) => element.value === entry.partner)?.label : ''}</Text>
                                        </Td>
                                        <Td>{entry.seeding}</Td>
                                        <Td>
                                            <Button size='sm' colorScheme='red'>
                                                Delete
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
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