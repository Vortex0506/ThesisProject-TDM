import { useState } from "react";
import { Test } from 'types';
import styled from "styled-components";
import TestBarHeader from "./TestBarHeader";
import TestList from "./TestList";

const Main = styled.div`
    position: absolute;
    top: 2.1%;
    left: 80%;
    background: black;
    height: 100%;
    width: 20%; 
    display: flex;
    flex-direction: column;
`
const Button = styled.button`
    position: absolute;
    top: 0%;
    left: 80%;
    width: 19.3%; 
    display: flex;
    flex-direction: column;
`



interface Props { 
    open: boolean; 
    formalDCRCreated: boolean; 
    setOpen: (val: boolean) => void;
    tests: Test[];
    deleteTest: (val: string) => void;
    deleteLastTrace: (val: string) => void;
    deleteLastContext: (val: string) => void;
    executeTests: () => void;
    createFormalDCR: () => void;
    createOldIteration: () => void; 
}


const TestBar = ({ open, formalDCRCreated, setOpen, tests, deleteTest, deleteLastTrace, deleteLastContext, executeTests, createFormalDCR, createOldIteration}: Props) => {

    return (<div>
        <Button onClick={(e) => setOpen(!open)}> Show Tests </Button>
        {open ? 
        <Main>
            <TestBarHeader formalDCRCreated={formalDCRCreated} createFormalDCR={createFormalDCR} executeTests={executeTests} createOldIteration={createOldIteration}/>
            <TestList tests={tests} deleteTest={deleteTest} deleteLastTrace={deleteLastTrace} deleteLastContext={deleteLastContext}/>
        </Main> : null}
    </div>)
}

export default TestBar