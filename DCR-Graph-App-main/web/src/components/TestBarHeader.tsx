import { useState } from "react";
import { Test } from 'types';
import styled from "styled-components";
//import TestUI from './TestUi';

const Main = styled.div`
    position: absolute;
    top: 0%;
    left: 0%;
    background: grey;
    height: 7;
    width: 95%; 
    display: flex;
    flex-direction: column;
    margin: 5px 5px 8px;
`
const Conditional = styled.div`
    position: absolute;
    top: 130%;
    left: -1%;
    background: grey;
    height: 00%;
    width: 100%; 
    display: flex;
    flex-direction: column;
    margin: 5px 5px 8px;
`

const Button0 = styled.button`
    top: 105%;
    position: absolute;
    flex-direction: column;
    left: 0%;
    width: 100.1%; 
    display: flex;
`

const Button1 = styled.button`
    position: absolute;
    top: 0%;
    left: -0.1%;
    width: 50%; 
    display: flex;
    flex-direction: column;
`
const Button2 = styled.button`
    position: absolute;
    top: 0%;
    left: 50%;
    width: 50%;
    display: flex;
    flex-direction: column;
`

interface Props {
    formalDCRCreated: boolean; 
    createFormalDCR: () => void;
    createOldIteration: () => void;
    executeTests: () => void;
}

const TestBarHeader = ({formalDCRCreated, createFormalDCR, executeTests, createOldIteration}: Props) => {
    return (<Main>
        <h2> Tests </h2>
        <Button0 onClick={(e) => createFormalDCR()}> Create formal DCR </Button0>
        {formalDCRCreated?
        <Conditional>
            <Button1 onClick={(e) => executeTests()}> Execute Tests</Button1>
            <Button2 onClick={(e) => createOldIteration()}> Create Old iteration</Button2>
        </Conditional>
        : null}
         
    </Main>)

}

export default TestBarHeader