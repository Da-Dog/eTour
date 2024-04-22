import {
    Box,
    Button, Checkbox,
    Flex, FormControl, FormHelperText, FormLabel,
    Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select,
    Tab, Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs, Tbody,
    Th,
    Thead,
    Tr, useDisclosure, VStack
} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import {FaPlus} from "react-icons/fa";
import {useState} from "react";

function EventDetail() {
    const {id, event_id} = useParams();
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
    const [tabIndex, setTabIndex] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleInputChange = (e) => {
        setEvent({
            ...event,
            [e.target.name]: e.target.value
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

            <Flex justifyContent="space-between" alignItems="center" mb={4} p={5}>
                <Heading ml={6} mt={2}  w={'75%'} isTruncated>Event Detail - {event.name}</Heading>
                {tabIndex === 1 ?
                    <Button colorScheme="teal" leftIcon={<FaPlus/>}>
                        Add Entry
                    </Button> : <></>
                }
            </Flex>

            <Tabs variant='soft-rounded' colorScheme='blue' onChange={(index) => setTabIndex(index)} isFitted>
                <TabList>
                    <Tab>Event Info</Tab>
                    <Tab>Entries</Tab>
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
                                    <Th>Team</Th>
                                    <Th>Seeding</Th>
                                    <Th>Action</Th>
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