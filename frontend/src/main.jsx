import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import {ChakraProvider} from "@chakra-ui/react";

import Home from "./home.jsx";
import Login from "./login.jsx";
import Player from "./tournament-manager/player.jsx";
import Tournaments from "./tournaments.jsx";
import TournamentManagerHome from "./tournament-manager/home.jsx";
import CreateTournament from "./tournament-manager/createTournament.jsx";
import EditTournament from "./tournament-manager/editTournament.jsx";
import Dashboard from "./tournament-manager/dashboard.jsx";
import Event from "./tournament-manager/event.jsx";
import Match from "./tournament-manager/match.jsx";
import Message from "./tournament-manager/message.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
    },
    {
        path: '/tournaments',
        element: <Tournaments/>,
    },
    {
        path: '/tm',
        element: <TournamentManagerHome/>,
        children: [
            {
                path: 'new',
                element: <CreateTournament/>,
            },
            {
                path: ':id/edit',
                element: <EditTournament/>,
            },
            {
                path: ':id',
                element: <Dashboard/>,
            },
            {
                path: ':id/player',
                element: <Player/>,
            },
            {
                path: ':id/event',
                element: <Event/>,
            },
            {
                path: ':id/match',
                element: <Match/>,
            },
            {
                path: ':id/message',
                element: <Message/>,
            }
        ],
    },
    {
        path: '/player',
        element: <Player/>,
    },
    {
        path: '/login',
        element: <Login/>,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <ChakraProvider>
        <RouterProvider router={router}/>
    </ChakraProvider>
)
