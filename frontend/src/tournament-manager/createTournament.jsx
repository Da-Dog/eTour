import { useState } from "react";
import {createTournament} from "../api.jsx";
import {useNavigate} from "react-router-dom";
import TournamentForm from "./tournamentForm.jsx";

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
        <TournamentForm
            type="create" name={name} setName={setName}
            description={description} setDescription={setDescription}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            address1={address1} setAddress1={setAddress1}
            address2={address2} setAddress2={setAddress2}
            city={city} setCity={setCity}
            state={state} setState={setState}
            zipCode={zipCode} setZipCode={setZipCode}
            contactName={contactName} setContactName={setContactName}
            contactEmail={contactEmail} setContactEmail={setContactEmail}
            contactPhone={contactPhone} setContactPhone={setContactPhone}
            creating={creating}
            handleSubmit={handleSubmit}
        />
    );
}

export default CreateTournament;