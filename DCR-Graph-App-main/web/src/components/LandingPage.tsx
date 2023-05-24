import React, { useState, useEffect } from 'react';
import Button from "./ui/Button";
import { useCollaboratorServerContext } from '../helpers/CollaboratorServerProvider';
import ServerConnection from './ServerConnection';

import { XCircle } from "@styled-icons/boxicons-regular"

import { State, isStringArray, Invite } from "types";
import styled from "styled-components";

const FlexBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ButtonWrapper = styled.div`
  margin: 0 auto;
  margin-bottom: 3rem;
  width: 50%;
`

const GraphList = styled.ol`
  list-style: none;
  height: 100%;
  border: 1px solid black;
  margin: 0.5rem;
  padding: 0;
  overflow-y: scroll;
`

const ListElem = styled.li`
  display: flex;
  flex-direction: row;
  background-color: lightgrey;
  :nth-child(odd){
    background-color: inherit;
  }​
`

const GraphText = styled.div`
  width: 100%;
  height: 2rem;
  line-height: 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  overflow-x: hidden;
  :hover {
    font-weight: bold;
  }
`

const StyledX =  styled(XCircle)`
  align-self: flex-end;
  height: 2rem;
  line-height: 2rem;
  padding 5px;
  color: grey;
  cursor: pointer;
  :hover {
    color: black;
  }
`

type LandingPageProps = {
  setState: (state: State, graphId?: string) => void;
}

const LandingPage = ({ setState }: LandingPageProps) => {
  const [graphs, setGraphs] = useState<Array<string>>([]);
  const { invites, consumeInvite } = useCollaboratorServerContext();

  useEffect(() => {
    window.electron.listenToGraphFiles( (graphsFiles: unknown) => {
      if (isStringArray(graphsFiles)) {
        setGraphs(graphsFiles);
      }
    });
    window.electron.getGraphFiles();
    return () => {
      window.electron.clearGraphFilesListener();
    };
  }, []);
  
  const handleLoad = (fn: string) => {
    setState("Canvas");
    window.electron.loadGraph(fn);
  }

  const handleNew = () => {
    setState("Canvas");
    window.electron.newGraph();
  }

  const handleDelete = (fn: string) => {
    window.electron.deleteGraph(fn);
  }

  const handleAcceptInvite = (inv: Invite) => {
    setState("Canvas", inv.uiDCRGraphId);
    window.electron.acceptInvite(inv);
    consumeInvite(inv.uiDCRGraphId);
  }

  const handleRejectInvite = (inv: Invite) => {
    consumeInvite(inv.uiDCRGraphId);
  }

  return (
    <FlexBox>
      <h1>DCR Graph App</h1>
      <ServerConnection />
      <FlexBox>
        <h2 style={{marginLeft: "1rem", textAlign: "left"}}>Graphs:</h2>
        <GraphList>
          {graphs.map( (fn) => {
            return (
              <ListElem key={fn}>
                <GraphText onClick={() => handleLoad(fn)}>{fn.slice(0, -5)}</GraphText>
                <StyledX onClick={() => handleDelete(fn)}/>
              </ListElem>
            )
          } )}
        </GraphList>
      </FlexBox>
      <FlexBox>
        <h2 style={{marginLeft: "1rem", textAlign: "left"}}>Invites:</h2>
        <GraphList>
          {invites.map( (inv) => {
            return (
              <ListElem key={inv.uiDCRGraphId}>
                <GraphText onClick={() => handleAcceptInvite(inv)}>Invite from {inv.userName}</GraphText>
                <StyledX onClick={() => handleRejectInvite(inv)}/>
              </ListElem>
            )
          } )}
        </GraphList>
      </FlexBox>
      <ButtonWrapper>
        <Button 
          height={"2rem"} 
          color={'#36752f'} 
          onClick={() => handleNew()}>
            CREATE NEW
        </Button>
      </ButtonWrapper>
    </FlexBox>
  )
}

export default LandingPage