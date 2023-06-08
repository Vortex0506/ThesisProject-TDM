import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test, UiEvent} from 'types';
import TestUiHeader from './TestUiHeader';
import { useState } from "react";
import styled from "styled-components";
import ActiveTrace from './ActiveTrace';
import ActiveContext from './ActiveContext';

const Main = styled.div`
    position: absolute;
    background: black;
    display: flex;
    flex-direction: column;
    width: 30%;
    left: 30%;
    top: 0%;
    height: 20%;
`
const Button0 = styled.button`
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 25%;
    left: 75%;
    top: 2%;
    height 31%;
    background: grey;
`
const Button1 = styled.button`
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 25%;
    left: 75%;
    top: 35%;
    background: grey;
    height: 31%;    
`

const Button2 = styled.button`
    position: absolute;
    background: grey;
    display: flex;
    flex-direction: column;
    width: 25%;
    left: 75%;
    top: 68%;
    height: 30%;
`

const Button3 = styled.button`
    position: absolute;
    background: grey;
    display: flex;
    flex-direction: row ;
    width: 36.5%;
    left: 0.5%;
    top: 83%;
    height: 15%;
`
const Button4 = styled.button`
    position: absolute;
    background: grey;
    display: flex;
    flex-direction: row;
    width: 36.5%;
    left: 38%;
    top: 83%;
    height: 15%;    
`



interface Props {
    givenTrace: UiEvent[];
    givenContext: UiEvent[];
    polarity: string; 
    addAllContext: () => void;
    submitTest: () => void;
    clearActiveTest: () => void; 
    setPolarity: (val: string) => void; 
}


const ActiveTest = ({givenTrace, givenContext, polarity, addAllContext, setPolarity, submitTest, clearActiveTest}: Props) => {
    return(<Main>
        <ActiveTrace givenTrace={givenTrace}/>
        <ActiveContext givenContext={givenContext}/>
        <Button0 onClick={(e) => submitTest()}> Submit Test</Button0>
        <Button1 onClick={(e) => clearActiveTest()}> Clear active Test</Button1>
        <Button2 onClick={(e) => addAllContext()}> Add all Context</Button2>
        <Button3> <input type="radio" name="polarityTest" value="pos" onChange={e=> setPolarity(e.target.value)} /> Positive-Test </Button3>
        <Button4> <input type="radio" name="polarityTest" value="neg" onChange={e=> setPolarity(e.target.value)} /> Negative-Test</Button4> 
    </Main>)
}

export default ActiveTest