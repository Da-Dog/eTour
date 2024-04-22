import { useState } from 'react';
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    List,
    ListItem,
    FormHelperText, Button
} from '@chakra-ui/react';

const TeamInput = ({ team, match, setMatch, entries }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [isPopoverOpen, setPopoverOpen] = useState(false);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setMatch({
            ...match,
            [team]: value
        });

        if (value.length > 1) {
            const filteredEntries = entries.filter(entry =>
                entry.player.toLowerCase().includes(value.toLowerCase()) ||
                (entry.partner && entry.partner.toLowerCase().includes(value.toLowerCase()))
            );
            setSearchResults(filteredEntries);
            if (filteredEntries.length > 0) {
                setPopoverOpen(true);
            } else {
                setPopoverOpen(false);
            }
        } else {
            setSearchResults([]);
            setPopoverOpen(false);
        }
    };

    const handleSearchResultClick = (entryId) => {
        setMatch({
            ...match,
            [team]: entryId
        });
        setSearchResults([]);
        setPopoverOpen(false);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setPopoverOpen(false);
        }, 200);
    };

    return (
        <FormControl>
            <FormLabel htmlFor={`team-input-${team}`}>{`Team ${team} - Entry`}</FormLabel>
            <Input
                id={`team-input-${team}`}
                placeholder="Type to search players"
                value={match[team]}
                onChange={handleInputChange}
                onBlur={handleBlur}
            />
            {isPopoverOpen && (
                <Box position="absolute" zIndex="popover" bg="white" width="100%" mt="1">
                    <List>
                        {searchResults.map((result) => (
                            <ListItem key={result.entry_id} p={1}>
                                <Button variant="ghost" width="100%" justifyContent="flex-start" onClick={() => handleSearchResultClick(result.entry_id)}>
                                    {result.player}{result.partner ? ` & ${result.partner}` : ''}
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
            <FormHelperText>Enter a player's name to search for entries.</FormHelperText>
        </FormControl>
    );
};

export default TeamInput;
