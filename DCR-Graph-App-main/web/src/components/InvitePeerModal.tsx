import styled from "styled-components";

import Button from "./ui/Button";

import { ActiveUser } from '../../../types/build/types';
import { useEffect } from "react";

import { useServerConnectionContext } from "../helpers/ServerConnectionProvider";

const Main = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 30%;
  top: 30%;
  left: 50%;
  background-color: white;
  border: 1px solid black;
  transform: translate(-50%, -50%);
`

const List = styled.ol`
  list-style: none;
  height: 100%;
  margin: 0.5rem;
  padding: 0;
  overflow-y: scroll;
`

const ListElem = styled.li`
  display: flex;
  flex-direction: row;
  background-color: lightgrey;
  padding: 0.5rem;
  cursor: pointer;
  :nth-child(odd){
    background-color: inherit;
  }​
`

interface Props {
  sendInvite: (user: ActiveUser) => void;
  close: () => void;
}

const InvitePeerModal = ({ 
  sendInvite,
  close
}: Props) => {
  const { activeUsers, refreshActiveUsers } = useServerConnectionContext();

  useEffect(() => {
    refreshActiveUsers();
  }, [refreshActiveUsers]);

  return (
    <Main>
      Active Users:
      <List>
        {activeUsers.map( user =>
          <ListElem key={user.id} onClick={() => {
            sendInvite(user);
          }}>
            {user.name}
          </ListElem>
        )}
      </List>
      <Button color={"green"} onClick={() => refreshActiveUsers()}>REFRESH</Button>
      <Button color={"red"} onClick={() => close()}>CLOSE</Button>
    </Main>
  )
}

export default InvitePeerModal;