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
import {FaHammer, FaPlus, FaRandom, FaTrash} from "react-icons/fa";
import {useEffect, useState} from "react";
import {
    addEntry,
    autoDraw,
    deleteEntry,
    deleteEvent,
    getEvent,
    getEventBracket, getMatch,
    getMatches, manualDraw, removeAllDraws,
    updateEntry,
    updateEvent, updateMatch
} from "../api.jsx";
import DrawTab from "./eventDetailTabs/drawTab.jsx";

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
        seed: '',
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
    const [drawSize, setDrawSize] = useState(2);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {isOpen: isMatchOpen, onOpen: onMatchOpen, onClose: onMatchClose} = useDisclosure();
    const {isOpen: isEntryOpen, onOpen: onEntryOpen, onClose: onEntryClose} = useDisclosure();
    const {isOpen: isRemoveDrawOpen, onOpen: onRemoveDrawOpen, onClose: onRemoveDrawClose} = useDisclosure();

    const [players, setPlayers] = useState([]);
    const [entriesSelect, setEntriesSelect] = useState([]);

    const navigate = useNavigate();

    const [bracketData, setBracketData] = useState([]);

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

    const handleRemoveDraw = () => {
        removeAllDraws(id, event_id).then(() => {
            location.reload();
        });
    }

    const handleSave = () => {
        updateEvent(id, event_id, event).then(response => {
            if ("error" in response) {
                alert(response.error);
            } else {
                alert('Saved');
            }
        });
    }

    const handleEntrySave = () => {
        updateEntry(id, event_id, entry).then(response => {
            if ("error" in response) {
                alert(response.error);
            } else {
                setEntries(entries.map(entryElement => {
                    if (entryElement.entry_id === entry.entry_id) {
                        return {
                            entry_id: entry.entry_id,
                            player: entry.player,
                            partner: entry.partner,
                            seed: entry.seed,
                        }
                    }
                    return entryElement;
                }));
                onEntryClose();
            }
        });
    }

    const handleEntryCreate = () => {
        addEntry(id, event_id, entry).then(response => {
            if ("error" in response) {
                alert(response.error);
            } else {
                setEntries([...entries, {
                    entry_id: response.id,
                    player: entry.player,
                    partner: entry.partner,
                    seed: entry.seed,
                }]);
                onEntryClose();
            }
        });
    }

    const handleEntryEdit = (entry) => {
        setEntry({
            entry_id: entry.entry_id,
            player: entry.player,
            partner: entry.partner,
            seed: entry.seed,
        });
        onEntryOpen();
    }

    const handleEntryCreateOpen = () => {
        setEntry({
            entry_id: 0,
            player: '',
            partner: '',
            seed: '',
        });
        onEntryOpen();
    }

    const handleEntryDelete = (entry) => {
        deleteEntry(id, event_id, entry).then(response => {
            if (response) {
                setEntries(entries.filter(entryElement => entryElement.entry_id !== entry));
            }
        });
    }

    const handleAutoDraw = () => {
        autoDraw(id, event_id, drawSize).then(response => {
            if (response.error) {
                alert(response.error);
            } else {
                setMatches(response.draw);
                getEventBracket(id, event_id).then(response => {
                    setBracketData(response.draw);
                });
            }
        });
    }

    const handleManualDraw = () => {
        manualDraw(id, event_id, drawSize).then(response => {
            if (response.error) {
                alert(response.error);
            } else {
                setMatches(response.draw);
                getEventBracket(id, event_id).then(response => {
                    setBracketData(response.draw);
                });
            }
        });
    }

    const handleOpenMatch = (match) => {
        getMatch(id, event_id, match).then(response => {
            if (response.score) {
                response.score1 = response.score.split(',')[0].split('-')[0];
                response.score2 = response.score.split(',')[0].split('-')[1];
                if (response.score.split(',').length > 1) {
                    response.score3 = response.score.split(',')[1].split('-')[0];
                    response.score4 = response.score.split(',')[1].split('-')[1];
                } else {
                    response.score3 = '';
                    response.score4 = '';
                }
                if (response.score.split(',').length > 2) {
                    response.score5 = response.score.split(',')[2].split('-')[0];
                    response.score6 = response.score.split(',')[2].split('-')[1];
                } else {
                    response.score5 = '';
                    response.score6 = '';
                }
            }
            setMatch({
                match: response.match ? response.match : '',
                round: response.round ? response.round : 'A',
                court: response.court ? response.court : '',
                team1: response.team1 ? response.team1 : '',
                team2: response.team2 ? response.team2 : '',
                score1: response.score1 ? response.score1 : '',
                score2: response.score2 ? response.score2 : '',
                score3: response.score3 ? response.score3 : '',
                score4: response.score4 ? response.score4 : '',
                score5: response.score5 ? response.score5 : '',
                score6: response.score6 ? response.score6 : '',
                scheduled_time: response.scheduled_start_time,
                note: response.note ? response.note : '',
                no_match: response.no_match,
            });
            onMatchOpen();
        });
    }

    const handleUpdateMatch = () => {
        updateMatch(id, event_id, match).then(response => {
            if (response.error) {
                alert(response.error);
            } else {
                setMatches(matches.map(matchElement => {
                    if (matchElement.match === match.match) {
                        return response
                    }
                    return matchElement;
                }));
                getEventBracket(id, event_id).then(response => {
                    setBracketData(response.draw);
                });
                onMatchClose();
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
                    seed: entry.seed,
                }
            }));
            setPlayers(response.players.map(player => {
                return {
                    value: player.id,
                    label: player.first_name + ' ' + player.last_name
                }
            }));
            if (response.entries.length > 0) {
                setDrawSize(2 ** Math.ceil(Math.log2(response.entries.length)));
            } else {
                setDrawSize(2);
            }
        });
        getMatches(id, event_id).then(response => {
            setMatches(response.matches);
        });
        getEventBracket(id, event_id).then(response => {
            setBracketData(response.draw);
        });
    }, [event_id, id]);

    useEffect(() => {
        setEntriesSelect(entries.map(entry => {
            return {
                value: entry.entry_id,
                label: players.find(player => player.value === entry.player).label + (entry.partner ? ' / ' + players.find(player => player.value === entry.partner).label : '')
            }
        }));
    }, [isMatchOpen, entries]);

    return (
        <Box p={5}>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        Are you sure you want to delete this event?
                        <br/><br/>
                        Events with entries can not be deleted, if you want to delete this event, please delete all
                        entries first.
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

            <Modal isOpen={isRemoveDrawOpen} onClose={onRemoveDrawClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Confirm Remove Draw</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        Are you sure you want to remove the draw for this event? This action can not be undone!
                        <br/><br/>
                        All matches in the draw, results and schedule will be removed.
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onRemoveDrawClose}>
                            Cancel
                        </Button>
                        <Button variant="ghost" colorScheme="red" onClick={handleRemoveDraw}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isEntryOpen} onClose={onEntryClose} size='lg'>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Entry - {entry.entry_id === 0 ? "New" : entry.entry_id}</ModalHeader>
                    <ModalCloseButton/>
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
                            ) : <></>}
                            <FormControl>
                                <FormLabel>Seeding</FormLabel>
                                <Input type='number' name='seed' value={entry.seed}
                                       onChange={(e) => setEntry({...entry, seed: e.target.value})}/>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEntryClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={entry.entry_id ? handleEntrySave : handleEntryCreate}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isMatchOpen} onClose={onMatchClose} size='lg'>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Match - {match.match ? match.match : "New"}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <VStack spacing={3}>
                            <FormControl>
                                <FormLabel>Match</FormLabel>
                                <Input type='number' name='match' value={match.match} isDisabled/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Round</FormLabel>
                                <ChakraSelect name='type' value={match.round} isDisabled>
                                    <option value="A">Additional</option>
                                    <option value="R">Round Robin</option>
                                    <option value="2">Final</option>
                                    <option value="4">Semi Final</option>
                                    <option value="8">Quarter Final</option>
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
                                <Input type='number' name='court' value={match.court}
                                       onChange={handleMatchInputChange}/>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Team 1</FormLabel>
                                <Select
                                    name='team1'
                                    value={entriesSelect.find(option => option.value === match.team1)}
                                    onChange={(option) => setMatch({...match, team1: option ? option.value : null})}
                                    options={entriesSelect}
                                    isSearchable
                                    isClearable
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Team 2</FormLabel>
                                <Select
                                    name='team2'
                                    value={entriesSelect.find(option => option.value === match.team2)}
                                    onChange={(option) => setMatch({...match, team2: option ? option.value : null})}
                                    options={entriesSelect}
                                    isSearchable
                                    isClearable
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Score</FormLabel>
                                <Flex>
                                    <Input type='number' name='score1' value={match.score1}
                                           onChange={handleMatchInputChange} width="20%" mr={1}/>
                                    <Text mt={1}>-</Text>
                                    <Input type='number' name='score2' value={match.score2}
                                           onChange={handleMatchInputChange} width="20%" ml={1} mr={3}/>
                                    {event.scoring_format === 'S' ? <>
                                        <Input type='number' name='score3' value={match.score3}
                                               onChange={handleMatchInputChange} width="20%" mr={1}/>
                                        <Text mt={1}>-</Text>
                                        <Input type='number' name='score4' value={match.score4}
                                               onChange={handleMatchInputChange} width="20%" ml={1} mr={3}/>
                                        <Input type='number' name='score5' value={match.score5}
                                               onChange={handleMatchInputChange} width="20%" mr={1}/>
                                        <Text mt={1}>-</Text>
                                        <Input type='number' name='score6' value={match.score6}
                                               onChange={handleMatchInputChange} width="20%" ml={1}/>
                                    </> : <></>
                                    }
                                </Flex>
                                <FormHelperText>Enter team 1 score then team 2 score</FormHelperText>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Scheduled Time</FormLabel>
                                <Input type='datetime-local' name='scheduled_time' value={match.scheduled_time}
                                       onChange={handleMatchInputChange}/>
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
                        <Button colorScheme="blue" onClick={handleUpdateMatch}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Flex justifyContent="space-between" alignItems="center" mb={4} p={5}>
                <Heading ml={6} mt={2} w={'75%'} isTruncated>Event Detail - {event.name}</Heading>
                {tabIndex === 1 ?
                    <Button colorScheme="teal" leftIcon={<FaPlus/>} onClick={handleEntryCreateOpen}>
                        Add Entry
                    </Button> : <></>
                }
                {tabIndex === 2 && !matches ?
                    <>
                        <b>Size:</b><ChakraSelect name='drawSize' value={drawSize}
                                                  onChange={(e) => setDrawSize(parseInt(e.target.value))} w='15%'
                                                  ml={1}>
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="8">8</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                        <option value="64">64</option>
                        <option value="128">128</option>
                        <option value="256">256</option>
                        <option value="512">512</option>
                    </ChakraSelect>
                        <Button colorScheme="blue" leftIcon={<FaHammer/>} ml={2} pl={6} pr={6}
                                onClick={handleManualDraw}>
                            Manual Draw
                        </Button>
                        <Button colorScheme="teal" leftIcon={<FaRandom/>} ml={2} pl={6} pr={6} onClick={handleAutoDraw}>
                            Auto Draw
                        </Button>
                    </> : <></>
                }
                {tabIndex === 2 && matches ?
                    <Button colorScheme="red" leftIcon={<FaTrash/>} onClick={onRemoveDrawOpen}>
                        Remove Draw
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
                                <ChakraSelect name='scoring_format' value={event.scoring_format}
                                              onChange={handleInputChange}>
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
                                            <Text
                                                textTransform='capitalize'>{players.find((element) => element.value === entry.player)?.label}</Text>
                                            <Text
                                                textTransform='capitalize'>{entry.partner ? players.find((element) => element.value === entry.partner)?.label : ''}</Text>
                                        </Td>
                                        <Td>{entry.seed}</Td>
                                        <Td>
                                            <Button size='sm' colorScheme='red'
                                                    onDoubleClick={() => handleEntryDelete(entry.entry_id)}>
                                                Delete
                                            </Button>
                                            <Button size='sm' colorScheme='blue' ml={2}
                                                    onClick={() => handleEntryEdit(entry)}>
                                                Edit
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TabPanel>
                    <TabPanel>
                        {bracketData.length > 0 ? <DrawTab bracketData={bracketData} handleOpenMatch={handleOpenMatch}/> : <></>}
                    </TabPanel>
                    <TabPanel>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Time</Th>
                                    <Th>Team 1</Th>
                                    <Th>Team 2</Th>
                                    <Th>Round</Th>
                                    <Th>Score</Th>
                                    <Th>Duration</Th>
                                    <Th>Court</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {matches ? matches.map((match, index) => (
                                    <Tr key={index} _hover={{backgroundColor: 'gray.200'}} style={{cursor: "pointer"}}
                                        onClick={() => handleOpenMatch(match.match)}>
                                        <Th>{match.match}</Th>
                                        <Td>{match.time}</Td>
                                        <Td>{match.team1}</Td>
                                        <Td>{match.team2}</Td>
                                        <Td>{match.round}</Td>
                                        <Td>{match.score.replaceAll(',', ', ')}</Td>
                                        <Td>{match.duration}</Td>
                                        <Td>{match.court}</Td>
                                    </Tr>
                                )) : <></>
                                }
                            </Tbody>
                        </Table>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default EventDetail;