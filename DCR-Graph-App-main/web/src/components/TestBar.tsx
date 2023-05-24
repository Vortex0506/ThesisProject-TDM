import { useState } from "react";
import { Test } from 'types';
import styled from "styled-components";
import TestBarHeader from "./TestBarHeader";
import TestList from "./TestList";

const Main = styled.div`
    position: absolute;
    top: 6%;
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
    left: 87%;
    display: flex;
    flex-direction: column;
`

const Button1 = styled.button`
    position: absolute;
    top: 3%;
    left: 91%;
    display: flex;
    flex-direction: column;
`
const Button2 = styled.button`
    top: 3%;
    position: absolute;
    flex-direction: column;
    left: 80%;
    display: flex;
`




interface Props { 
    open: boolean; 
    setOpen: (val: boolean) => void;
    tests: Test[];
    deleteTest: (val: string) => void;
    deleteLastTrace: (val: string) => void;
    deleteLastContext: (val: string) => void;
    executeTests: () => void;
    createFormalDCR: () => void;
    //tests: Test[];

    //setTests: (val: )

}


const TestBar = ({ open, setOpen, tests, deleteTest, deleteLastTrace, deleteLastContext, executeTests, createFormalDCR}: Props) => {

    return (<div>
        <Button onClick={(e) => setOpen(!open)}> Open Tests </Button>
        <Button2 onClick={(e) => createFormalDCR()}> Create formal DCR </Button2>
        <Button1 onClick={(e) => executeTests()}> Execute Tests</Button1> 
        {open ? 
        <Main>
            <TestBarHeader/>
            <TestList tests={tests} deleteTest={deleteTest} deleteLastTrace={deleteLastTrace} deleteLastContext={deleteLastContext}/>
        </Main> : null}
    </div>)
}

export default TestBar