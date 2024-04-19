import {Box, Button, Image, VStack} from "@chakra-ui/react";
import {useNavigate, useParams} from "react-router-dom";
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
import {useEffect} from "react";

function Logout() {
    Cookies.remove("token");
    Cookies.remove("refresh");
    window.location.href = "/";
}

function refreshCheck(navigate) {
    if (!Cookies.get("last_refresh") || Cookies.get("last_refresh") <= Date.now() - 1000 * 60 * 4) {
        refresh().then(success => {
            if (!success) {
                navigate('/login');
            }
        });
    }
}

function Sidebar({isSidebarDisabled}) {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        refreshCheck(navigate);
        setInterval(() => {
            refreshCheck(navigate);
        }, 1000 * 60);
    });

    return (
        <Box w="250px" h="100vh" bg="white" position="absolute" left="0" top="0">
            <VStack align="start" spacing={5} p={6}>
                <Image src="/logo.png" alt="Logo" boxSize='80px'/>
                <Button variant="ghost" leftIcon={<FaTachometerAlt/>} width="100%" justifyContent="flex-start" isDisabled={isSidebarDisabled} onClick={() => {navigate("/tm/" + id)}}>Dashboard</Button>
                <Button variant="ghost" leftIcon={<FaAddressCard/>} width="100%" justifyContent="flex-start" isDisabled={isSidebarDisabled} onClick={() => {navigate("/tm/" + id + "/player")}}>Player</Button>
                <Button variant="ghost" leftIcon={<FaCalendarAlt/>} width="100%" justifyContent="flex-start" isDisabled={isSidebarDisabled} onClick={() => {navigate("/tm/" + id + "/event")}}>Event</Button>
                <Button variant="ghost" leftIcon={<FaNetworkWired/>} width="100%" justifyContent="flex-start" isDisabled={isSidebarDisabled} onClick={() => {navigate("/tm/" + id + "/match")}}>Match</Button>
                <Button variant="ghost" leftIcon={<FaEnvelopeOpen/>} width="100%" justifyContent="flex-start" isDisabled={isSidebarDisabled} onClick={() => {navigate("/tm/" + id + "/message")}}>Message</Button>
            </VStack>
            <VStack align="start" spacing={5} p={6} position="absolute" bottom="0" w="250px">
                <Button variant="ghost" leftIcon={<FaSave/>} width="100%" justifyContent="flex-start" isDisabled={isSidebarDisabled} onClick={() => {navigate("/tm")}}>Close</Button>
                <Button variant="ghost" leftIcon={<FaSignOutAlt/>} width="100%" justifyContent="flex-start" onClick={Logout}>Logout</Button>
            </VStack>
        </Box>
    );
}

export default Sidebar;