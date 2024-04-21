import {useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    DrawerFooter,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    Input,
    VStack,
    Textarea,
    Select,
    FormLabel,
    FormControl,
    ModalFooter,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalHeader,
    ModalContent,
    ModalOverlay
} from "@chakra-ui/react";
import {FaPlus} from "react-icons/fa";
import {addPlayer, deletePlayer, getPlayer, getPlayerEntries, getTournamentPlayers, updatePlayer} from "../api.jsx";
import {useParams} from "react-router-dom";

function calculateAge(dob) {
    const dobDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    return age;
}

function Player() {
    const [players, setPlayers] = useState([]);
    const [player, setPlayer] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        notes: '',
    });
    const addPlayerRef = useRef();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [playerToDelete, setPlayerToDelete] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [playerEntries, setPlayerEntries] = useState([]);
    const { isOpen: isEntriesOpen, onOpen: onEntriesOpen, onClose: onEntriesClose } = useDisclosure();
    const [searchTerm, setSearchTerm] = useState("");

    const {id} = useParams();

    const handleInputChange = (event) => {
        setPlayer({
            ...player,
            [event.target.name]: event.target.value
        });
    };

    const handleOpen = (playerToEdit) => {
        if (playerToEdit) {
            getPlayer(id, playerToEdit).then((data) => {
                setPlayer(data);
            });
            setIsEditMode(playerToEdit);
        } else {
            setPlayer({
                first_name: '',
                middle_name: '',
                last_name: '',
                email: '',
                phone: '',
                date_of_birth: '',
                gender: 'M',
                notes: '',
            });
            setIsEditMode(false);
        }
        onOpen();
    };

    const handleSubmit = async () => {
        if (!player.first_name) {
            alert("First name is required");
            return;
        }

        if (!player.last_name) {
            alert("Last name is required");
            return;
        }

        if (!player.gender) {
            alert("Gender is required");
            return;
        }

        if (player.email && !/\S+@\S+\.\S+/.test(player.email)) {
            alert("A valid email is required");
            return;
        }

        if (isEditMode) {
            updatePlayer(id, isEditMode, player).then(() => {
                setPlayers(players.map(p => p.id === isEditMode ? {
                    id: isEditMode,
                    name: `${player.first_name} ${player.middle_name ? player.middle_name : ''} ${player.last_name}`,
                    email: player.email,
                    phone: player.phone,
                    date_of_birth: player.date_of_birth,
                    gender: player.gender,
                    create_time: new Date().toLocaleDateString('en-CA')
                } : p));
                onClose();
            });
        } else {
            addPlayer(id, player).then((data) => {
                setPlayers([...players, {
                    id: data.id,
                    name: `${player.first_name} ${player.middle_name ? player.middle_name : ''} ${player.last_name}`,
                    email: player.email,
                    phone: player.phone,
                    date_of_birth: player.date_of_birth,
                    gender: player.gender,
                    create_time: new Date().toLocaleDateString('en-CA')
                }]);
                setPlayer({
                    first_name: '',
                    middle_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    date_of_birth: '',
                    gender: 'M',
                    notes: '',
                });
            });
        }
    };

    const handleDeleteOpen = (player) => {
        setPlayerToDelete(player);
        onDeleteOpen();
    };

    const handleDeleteClose = () => {
        setPlayerToDelete(null);
        onDeleteClose();
    };

    const handleDeleteConfirm = () => {
        deletePlayer(id, playerToDelete.id).then(() => {
            setPlayers(players.filter(p => p.id !== playerToDelete.id));
            handleDeleteClose();
        });
    };

    const handleEntriesOpen = (playerId) => {
        getPlayerEntries(id, playerId).then((data) => {
            if (data) {
                setPlayerEntries(data);
                onEntriesOpen();
            }
        });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        getTournamentPlayers(id).then((data) => {
            if (data) {
                setPlayers(data.participants);
            }
        });
    }, []);

    return (
        <Box p={5}>
            <Modal isOpen={isDeleteOpen} onClose={handleDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete <b>{playerToDelete ? playerToDelete.name : 'this player'}</b>?
                        <br/><br/>
                        Note that if there is any entry associated with this player, it will be deleted as well.
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleDeleteClose}>
                            Cancel
                        </Button>
                        <Button variant="ghost" colorScheme="red" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isEntriesOpen} onClose={onEntriesClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Player Entries</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {playerEntries.map((entry, index) => (
                            <Box key={index} borderWidth="1px" borderRadius="lg" overflow="hidden" mb={3}>
                                <Box p="6">
                                    <Box d="flex" alignItems="baseline">
                                        <Box
                                            color="gray.500"
                                            fontWeight="semibold"
                                            letterSpacing="wide"
                                            fontSize="xs"
                                            textTransform="uppercase"
                                            ml="2"
                                        >
                                            Event {index + 1}
                                        </Box>
                                    </Box>

                                    <Box
                                        mt="1"
                                        fontWeight="semibold"
                                        as="h4"
                                        lineHeight="tight"
                                        isTruncated
                                    >
                                        {entry.event}
                                    </Box>

                                    {entry.partner && (
                                        <Box>
                                            <Box as="span" color="gray.600" fontSize="sm">
                                                Partner: {entry.partner}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onEntriesClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Drawer
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
                finalFocusRef={addPlayerRef}
            >
                <DrawerOverlay/>
                <DrawerContent>
                    <DrawerCloseButton/>
                    <DrawerHeader>{isEditMode ? "Edit Player" : "New Player"}</DrawerHeader>

                    <DrawerBody>
                        <VStack spacing={3}>
                            <FormControl>
                                <FormLabel>First Name</FormLabel>
                                <Input name='first_name' value={player.first_name} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Middle Name</FormLabel>
                                <Input name='middle_name' value={player.middle_name} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Last Name</FormLabel>
                                <Input name='last_name' value={player.last_name} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input name='email' value={player.email} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Phone</FormLabel>
                                <Input name='phone' value={player.phone} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Date of Birth</FormLabel>
                                <Input type='date' name='date_of_birth' value={player.date_of_birth} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Gender</FormLabel>
                                <Select name='gender' value={player.gender} onChange={handleInputChange}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Notes</FormLabel>
                                <Textarea name='notes' value={player.notes} onChange={handleInputChange} />
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
                <Heading ml={6} mt={2}>Players</Heading>
                <Box w={'40%'}>
                    <Input placeholder="Search players" value={searchTerm} onChange={handleSearchChange} />
                </Box>
                <Button colorScheme="teal" leftIcon={<FaPlus/>} ref={addPlayerRef} onClick={() => handleOpen(false)}>
                    Add Player
                </Button>
            </Flex>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Phone Number</Th>
                        <Th>Age</Th>
                        <Th>Gender</Th>
                        <Th>Joined at</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {players.filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase())).map((player, index) => (
                        <Tr key={index}  _hover={{ backgroundColor: 'gray.200' }}>
                            <Td>{player.name}</Td>
                            <Td>{player.email}</Td>
                            <Td>{player.phone}</Td>
                            <Td>{player.date_of_birth ? calculateAge(player.date_of_birth) : ''}</Td>
                            <Td>{player.gender === 'M' ? 'Male' : 'Female'}</Td>
                            <Td>{player.create_time}</Td>
                            <Td>
                                <Button colorScheme="pink" size="sm" mr={3} onClick={() => handleEntriesOpen(player.id)}>
                                    Entries
                                </Button>
                                <Button colorScheme="teal" size="sm" mr={3} onClick={() => handleOpen(player.id)}>
                                    Edit
                                </Button>
                                <Button colorScheme="red" size="sm" onClick={() => handleDeleteOpen(player)}>
                                    Remove
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

export default Player;