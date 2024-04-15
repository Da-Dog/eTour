import {Container} from "@chakra-ui/react";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {refresh} from "./api.jsx";

function TournamentManager() {
    const navigate = useNavigate();

    useEffect(() => {
        refresh().then(success => {
            if (!success) {
                navigate('/login');
            }
        });
    }, [navigate]);

    return (
        <Container>

        </Container>
    );
}

export default TournamentManager;