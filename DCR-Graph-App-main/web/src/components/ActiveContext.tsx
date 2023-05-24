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
    margin: 2px;
    width: 20%;
    right: 28%;
    top: 3%;
`

interface Props {
    givenContext: Set<UiEvent>;
}




const ActiveContext = ({givenContext}: Props) => {
    const cpContext = givenContext;
    const contextAsArray = Array.from(cpContext);

    return(<Main>
        <> Context:  </>
        <> ( </>
        {contextAsArray.map((event) => 
            <> {event.name}  &nbsp;</>
        )}
        <> ) &nbsp; </>
    </Main>)
}

export default ActiveContext