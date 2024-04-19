import { useState, useEffect } from "react";
import { editTournament, getTournament } from "../api.jsx";
import { useNavigate, useParams } from "react-router-dom";
import TournamentForm from "./tournamentForm.jsx";

function EditTournament() {
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

    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        getTournament(id).then(tournamentData => {
            const data = tournamentData.tournament;
            setName(data.name || "")
            setDescription(data.description || "")
            setStartDate(data.start_date || "")
            setEndDate(data.end_date || "")
            setAddress1(data.address_1 || "")
            setAddress2(data.address_2 || "")
            setCity(data.city || "")
            setState(data.state || "")
            setZipCode(data.zip_code || "")
            setContactName(data.contact_name || "")
            setContactEmail(data.contact_email || "")
            setContactPhone(data.contact_phone || "")
        });
    }, [id]);

    const handleSubmit = (event) => {
        setUpdating(true);
        editTournament(id, name, description, startDate, endDate, address1, address2, city, state, zipCode, contactName, contactEmail, contactPhone).then(response => {
            if (response) {
                alert("Tournament updated successfully");
                navigate("/tm");
            } else {
                setUpdating(false);
            }
        });
        event.preventDefault();
    };

    return (
        <TournamentForm
            title="Tournament Edit" name={name} setName={setName}
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
            creating={updating}
            handleSubmit={handleSubmit}
        />
    );
}

export default EditTournament;