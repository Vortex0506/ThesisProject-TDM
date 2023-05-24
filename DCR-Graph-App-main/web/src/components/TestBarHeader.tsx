import { useState } from "react";
import { Test } from 'types';
import styled from "styled-components";
//import TestUI from './TestUi';

const Main = styled.div`
    position: absolute;
    top: 0%;
    left: 0%;
    background: grey;
    height: 7.5%;
    width: 95%; 
    display: flex;
    flex-direction: column;
    margin: 5px 5px 8px;
`

interface Props {
    
}

const TestBarHeader = ({}:Props) => {
    return (<Main>
        <h2> Tests </h2>
    </Main>)

}

export default TestBarHeader