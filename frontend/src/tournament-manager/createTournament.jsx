import {Box, Button, FormControl, FormLabel, Heading, Input, Textarea, VStack} from "@chakra-ui/react";
import { useState } from "react";
import {createTournament} from "../api.jsx";
import {useNavigate} from "react-router-dom";

function CreateTournament() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");

    const [creating, setCreating] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        setCreating(true);
        createTournament(name, description, startDate, endDate, address1, address2, city, state, zipCode, contactName, contactEmail, contactPhone).then(response => {
            if (response) {
                alert("Tournament created successfully");
                navigate("/tm");
            } else {
                setCreating(false);
            }
        });
        event.preventDefault();
    };

    return (
        <Box p={5}>
            <form onSubmit={handleSubmit}>
                <Heading as="h1" size="lg" mb="5">Create a Tournament</Heading>
                <VStack spacing="5">
                    <FormControl id="name" isRequired>
                        <FormLabel>Tournament Name</FormLabel>
                        <Input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </FormControl>
                    <FormControl id="description" isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} required />
                    </FormControl>
                    <FormControl id="start-date" isRequired>
                        <FormLabel>Start Date and Time</FormLabel>
                        <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    </FormControl>
                    <FormControl id="end-date" isRequired>
                        <FormLabel>End Date and Time</FormLabel>
                        <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                    </FormControl>
                    <FormControl id="address1" isRequired>
                        <FormLabel>Address 1</FormLabel>
                        <Input type="text" value={address1} onChange={e => setAddress1(e.target.value)} required />
                    </FormControl>
                    <FormControl id="address2">
                        <FormLabel>Address 2</FormLabel>
                        <Input type="text" value={address2} onChange={e => setAddress2(e.target.value)} />
                    </FormControl>
                    <FormControl id="city" isRequired>
                        <FormLabel>City</FormLabel>
                        <Input type="text" value={city} onChange={e => setCity(e.target.value)} required />
                    </FormControl>
                    <FormControl id="state" isRequired>
                        <FormLabel>State</FormLabel>
                        <Input type="text" value={state} onChange={e => setState(e.target.value)} required />
                    </FormControl>
                    <FormControl id="zipCode" isRequired>
                        <FormLabel>Zip Code</FormLabel>
                        <Input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} required />
                    </FormControl>
                    <FormControl id="contactName" isRequired>
                        <FormLabel>Contact Name</FormLabel>
                        <Input type="text" value={contactName} onChange={e => setContactName(e.target.value)} required />
                    </FormControl>
                    <FormControl id="contactEmail" isRequired>
                        <FormLabel>Contact Email</FormLabel>
                        <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                    </FormControl>
                    <FormControl id="contactPhone" isRequired>
                        <FormLabel>Contact Phone</FormLabel>
                        <Input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
                    </FormControl>
                    <Button colorScheme="teal" type="submit" isLoading={creating}>Create Tournament</Button>
                </VStack>
            </form>
        </Box>
    );
}

export default CreateTournament;