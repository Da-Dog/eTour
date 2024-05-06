import {Box, Divider, Flex, Text, VStack} from "@chakra-ui/react";
import './drawTab.css';

function DrawTab({bracketData, handleOpenMatch}) {

    return (
        <Flex flexDirection="row" h="100%" mt={3} justify='space-around' id="bracketSection">
            {bracketData.map((round, index) => (
                <Box key={index} mr={75}>
                    <Flex justifyContent="center" alignItems="center" mb={5}>
                        <Text as='b'>{round.round}</Text>
                    </Flex>
                    <VStack align='stretch' justify='space-around' spacing={2} h="100%" key={index}>
                        {round.matches.map((match, matchIndex) => (
                            // TODO: Figure out how to connect boxes with lines
                            <Box key={matchIndex} borderWidth="3px" borderRadius="lg"
                                 _hover={{backgroundColor: 'gray.200'}} style={{cursor: "pointer"}}
                                 onClick={() => handleOpenMatch(match.id)} h='150px' className={matchIndex % 2 === 0 ? "boxWithLine boxWithLineDown" : "boxWithLine boxWithLineUp"}>
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
                                            Match ID: {match.id}
                                        </Box>
                                    </Box>

                                    <Box
                                        mt="1"
                                        fontWeight="semibold"
                                        as="h4"
                                        lineHeight="tight"
                                        isTruncated
                                    >
                                        {match.team1 ? match.team1 : <br/>}
                                        <Divider mt={1} mb={1}/>
                                        {match.team2 ? match.team2 : <br/>}
                                    </Box>

                                    {match.no_match ?
                                        <Box as="span" color="red.600" fontSize="sm">
                                            No Match
                                        </Box>
                                        : match.score && (
                                        <Box as="span" color="gray.600" fontSize="sm">
                                            {match.score.replaceAll(',', ', ')}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            ))}
        </Flex>
    );
}

export default DrawTab;