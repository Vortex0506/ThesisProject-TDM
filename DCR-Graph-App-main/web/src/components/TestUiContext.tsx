import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test, UiEvent } from 'types';
import TestUiHeader from './TestUiHeader';
import { useState } from "react";
import styled from "styled-components";

const Main = styled.div`
    background: grey;
    display: flex;
    flex-direction: row;
    margin: 2px;
`

interface Props {
    givenTest: Test;
    i: number;
    deleteLastContext: (val: string) => void;
}


const TestUiContext = ({givenTest, i, deleteLastContext}: Props) => {
    const cpContext = givenTest.context;

    return(<Main>
        <> C:  </>
        <> ( </>
        {cpContext.map((event) => 
            <> "{event.name}"  &nbsp;</>
        )}
        <> ) &nbsp; </>
        <button onClick={(e) => deleteLastContext(givenTest.id)}> Delete last event</button>
    </Main>)
}

export default TestUiContext