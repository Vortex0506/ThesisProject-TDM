import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test } from 'types';
import TestUiHeader from './TestUiHeader';
import { useState } from "react";
import styled from "styled-components";

const Main = styled.div`
    background: grey;
    display: flex;
    flex-direction: row;
    margin: 2px;
`

const Element = styled.div` 
    margin: 1px;
`

interface Props {
    givenTest: Test;
    i: number;
    deleteLastTrace: (val: string) => void;
}

const handleDelete = () => {

}


const TestUiTrace = ({givenTest, i, deleteLastTrace}: Props) => {
    return(<Main>
        <> T:  </>
        <> ( </>
        {givenTest.trace.map((event) => 
            <> "{event.name}"  &nbsp;</>
        )}
        <> ) &nbsp; </>
        <button onClick={(e) => deleteLastTrace(givenTest.id)}> Delete last event</button>
    </Main>)
}

export default TestUiTrace