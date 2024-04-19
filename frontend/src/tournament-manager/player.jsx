import React from 'react';
import { Box, Button, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

function Player() {
    // Replace with actual data
    const players = [
        { id: 1, name: 'Player 1', age: 20, email: 'player1@example.com' },
        { id: 2, name: 'Player 2', age: 22, email: 'player2@example.com' },
    ];

    return (
        <Box p={5}>
            <Flex justifyContent="space-between">
                <Heading ml={7} mt={1} mb={5}>Player Page</Heading>
                <Button colorScheme="teal" variant="outline" mr={5} mt={5}>
                    Add Player
                </Button>
            </Flex>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {players.map((player, index) => (
                        <Tr key={index}>
                            <Td>{player.id}</Td>
                            <Td>{player.name}</Td>
                            <Td>{player.email}</Td>
                            <Td>
                                <Button colorScheme="teal" size="sm" mr={3}>
                                    Edit
                                </Button>
                                <Button colorScheme="red" size="sm">
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