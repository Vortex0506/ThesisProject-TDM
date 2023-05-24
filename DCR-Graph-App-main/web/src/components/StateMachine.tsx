import { useEffect, useState } from "react";

import Designer from "./Designer";
import LandingPage from "./LandingPage";
import { CollaboratorClientProvider } from "../helpers/CollaboratorClientProvider"

import { State } from "types";

const StateMachine = () => {
    const [graphId, setGraphId] = useState<string | null>(null);
    const [reactState, setReactState] = useState<State>("LandingPage");

    // Sets electron state upon starting up
    useEffect( () => {
        window.electron.setState("LandingPage");
    }, [])

    const setState = (state: State, graphId: string | null = null) => {
        setReactState(state);
        setGraphId(graphId);
        // Notifies electron of the changed state
        window.electron.setState(state);
    }

    const component = reactState === "LandingPage" ? <LandingPage setState={setState} /> : 
    <CollaboratorClientProvider>
        <Designer setState={setState} id={graphId}/>
    </CollaboratorClientProvider>;

    return component;
}

export default StateMachine;