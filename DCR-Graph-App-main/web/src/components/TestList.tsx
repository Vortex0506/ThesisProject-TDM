import { useState } from "react";
import { Test } from 'types';
import styled from "styled-components";
import TestUi from './TestUi';

const Main = styled.div`
    position: absolute;
    top: 8%;
    left: 0%;
    background: black;
    height: 100%;
    width: 95%; 
    display: flex;
    flex-direction: column;
    margin: 5px 5px 8px;
`

interface Props {
    tests: Test[]; 
    deleteTest: (val: string) => void;
    deleteLastTrace: (val: string) => void;
    deleteLastContext: (val: string) => void;
}

const TestList = ({tests, deleteTest, deleteLastTrace, deleteLastContext}:Props) => {
    return (<Main>
        {tests.map((test, i) => 
            <TestUi key={test.id} givenTest = {test} i={i} deleteTest={deleteTest} deleteLastTrace={deleteLastTrace} deleteLastContext={deleteLastContext} /> 
        )}
    </Main>)

}

export default TestList