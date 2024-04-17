import {Box, Button, Image, VStack} from "@chakra-ui/react";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {refresh} from "../api.jsx";
import {
    FaAddressCard,
    FaCalendarAlt,
    FaEnvelopeOpen,
    FaNetworkWired, FaSave,
    FaSignOutAlt,
    FaTachometerAlt
} from "react-icons/fa";
import Cookies from "js-cookie";

function Logout() {
    // remove all cookies and redirect to home page
    Cookies.remove("token");
    Cookies.remove("refresh");
    window.location.href = "/";
}

function Sidebar() {
    const navigate = useNavigate();

    useEffect(() => {
        refresh().then(success => {
            if (!success) {
                navigate('/login');
            }
        });
    }, [navigate]);

    return (
        <Box w="250px" h="100vh" bg="white">
            <VStack align="start" spacing={5} p={6}>
                <Image src="/logo.png" alt="Logo" boxSize='80px'/>
                <Button variant="ghost" leftIcon={<FaTachometerAlt/>} width="100%" justifyContent="flex-start">Dashboard</Button>
                <Button variant="ghost" leftIcon={<FaAddressCard/>} width="100%" justifyContent="flex-start">Player</Button>
                <Button variant="ghost" leftIcon={<FaCalendarAlt/>} width="100%" justifyContent="flex-start">Event</Button>
                <Button variant="ghost" leftIcon={<FaNetworkWired/>} width="100%" justifyContent="flex-start">Match</Button>
                <Button variant="ghost" leftIcon={<FaEnvelopeOpen/>} width="100%" justifyContent="flex-start">Message</Button>
            </VStack>
            <VStack align="start" spacing={5} p={6} position="absolute" bottom="0" w="250px">
                <Button variant="ghost" leftIcon={<FaSave/>} width="100%" justifyContent="flex-start">Close</Button>
                <Button variant="ghost" leftIcon={<FaSignOutAlt/>} width="100%" justifyContent="flex-start" onClick={Logout}>Logout</Button>
            </VStack>
        </Box>
    );
}

export default Sidebar;