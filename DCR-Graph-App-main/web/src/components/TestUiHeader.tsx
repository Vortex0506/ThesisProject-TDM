import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test } from 'types';
import styled from "styled-components";

const Main = styled.div`
    background: grey;
    display: flex;
    flex-direction: row;
    margin: 2px;
`
const Default = styled.button`
    background: grey;
`
const NotPassing = styled.button`
    background: red;
`
const Passing = styled.button`
    background: green;
`
interface Props {
    givenTest: Test;
    i: number;
    show: boolean; 
    setShow: (val: boolean) => void;
    deleteTest: (val: string) => void;
}



const TestUiHeader = ({givenTest, i, show, setShow, deleteTest}: Props) => {
    return(<Main>
        <> Test Num: {i} &nbsp;</>  
        <button onClick={(e) => deleteTest(givenTest.id)}> Delete</button>
        <button onClick={(e) => setShow(!show)}> open</button>
        { (givenTest.passes == -1) ? 
            <Default> ---</Default> : ((givenTest.passes == 0) ?
                                    <NotPassing> Fail </NotPassing> :
                                                      <Passing> Pass </Passing>)

        }
    </Main>)
}   

export default TestUiHeader