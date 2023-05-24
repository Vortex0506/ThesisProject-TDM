import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';
import { Test, UiEvent} from 'types';
import TestUiHeader from './TestUiHeader';
import { useState } from "react";
import styled from "styled-components";



interface Props {
    givenEvent: UiEvent;
}




const TestElement = ({givenEvent}: Props) => {
    return(<>{givenEvent.name}  &nbsp;</>)
}

export default TestElement