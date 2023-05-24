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
    right: 50%;
    top: 3%;

`

interface Props {
    givenTrace: UiEvent[];
}




const ActiveTrace = ({givenTrace}: Props) => {
    return(<Main>
        <> Trace:  </>
        <> ( </>
        {givenTrace.map((event) => 
            <> {event.name}  &nbsp;</>
        )}
        <> ) &nbsp; </>
    </Main>)
}

export default ActiveTrace