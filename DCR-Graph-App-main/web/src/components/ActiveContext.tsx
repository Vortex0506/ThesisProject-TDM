import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test, UiEvent} from 'types';
import TestUiHeader from './TestUiHeader';
import { useState } from "react";
import styled from "styled-components";

const Main = styled.div`
    position: absolute;
    background: grey;
    display: flex;
    flex-direction: row;
    width: 74%;
    left: 0.5%;
    top: 42%;
    height: 38%;
`

interface Props {
    givenContext: UiEvent[]; 
}




const ActiveContext = ({givenContext}: Props) => {
    const cpContext = givenContext;

    return(<Main>
        <> Context:  </>
        <> ( </>
        {cpContext.map((event) => 
            <> "{event.name}"  &nbsp;</>
        )}
        <> ) &nbsp; </>
    </Main>)
}

export default ActiveContext