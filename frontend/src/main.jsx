import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import {ChakraProvider} from "@chakra-ui/react";

import Home from "./home.jsx";
import Login from "./login.jsx";
import Player from "./player.jsx";
import Tournaments from "./tournaments.jsx";
import TournamentManager from "./tournament-manager.jsx";

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
        path: '/admin',
        element: <TournamentManager/>,
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
