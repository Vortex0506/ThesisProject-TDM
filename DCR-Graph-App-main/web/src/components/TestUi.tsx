import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test } from 'types';
import TestUiHeader from './TestUiHeader';
import { useState } from "react";
import TestUiTrace from './TestUiTrace';
import TestUiContext from './TestUiContext';
import styled from "styled-components";

const Main = styled.div`
    background: white; 
    display: flex;
    flex-direction: column;
    margin: 10px;
    padding: 2px 2px;
`

const Text1 = styled.div`
    background: grey;
    display: flex;
    flex-direction: column;
    margin: 2px;
`

interface Props {
    givenTest: Test;
    i: number;
    deleteTest: (val: string) => void;
    deleteLastTrace: (val: string) => void;
    deleteLastContext: (val: string) => void;
}

const TestUi = ({givenTest, i, deleteTest, deleteLastTrace, deleteLastContext}: Props) => {
    const [testShow, setTestShow] = React.useState<boolean>(false);

    return(<Main>
        <TestUiHeader key={givenTest.id} givenTest={givenTest} i={i} show={testShow} setShow={setTestShow} deleteTest={deleteTest}/>
        {testShow ?
        <div> 
            <TestUiTrace givenTest={givenTest} i={i} deleteLastTrace={deleteLastTrace} />
            <TestUiContext givenTest={givenTest} i={i} deleteLastContext={deleteLastContext} />
            <Text1>Polarity: {givenTest.polarity}</Text1>
        </div>
        : null }
        
    </Main>)
}

export default TestUi