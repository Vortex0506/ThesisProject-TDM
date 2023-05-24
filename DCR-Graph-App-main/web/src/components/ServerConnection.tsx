import { useState, useEffect } from 'react';
import Button from "./ui/Button";
import styled from "styled-components"

import { useServerConnectionContext } from "../helpers/ServerConnectionProvider";

const ConnectionWrapper = styled.div`
width: 50%;
height: 200px;
margin-right: 10px;
margin-left: auto;
display:flex;
`
const OnlineWrapper = styled.div`
flex: 1;
margin-right: 25px;
display:block;
`
const ButtonWrapper = styled.div`
width: 100%;
margin-right: 10px;
margin-top: 5px;
margin-bottom: 5px;
display:flex;
flex-wrap: wrap;
float:left;
`
const Input = styled.input`
width: 100%;
margin-right: 10px;
margin-top: -15px;
margin-left: auto;
`
const Text = styled.p`
margin: 0px;
margin-top: 3px;
float: left;
display:block;
`

const ServerConnection = () => {
    const {
        announce,
        depart,
        isOnline
    } = useServerConnectionContext();

    const [OnlineAs, setOnlineAs] = useState<string>('');

    const handleChangeName = (e:any) =>{
        setOnlineAs(e.target.value)
    }

    useEffect(() => {
        window.electron.getUsername().then( (name: string) => {
            setOnlineAs(name);
        }).catch( (err: Error) => {
            console.log(err);
        } );
    }, [setOnlineAs]);

    return (
        <ConnectionWrapper>
            <OnlineWrapper>
                <Text>Enter name: </Text>
                <Input type="Name" value={OnlineAs} onChange={handleChangeName} placeholder="Name"/>
                <Text>You are online: {String(isOnline)}</Text>
                <ButtonWrapper>
                <Button 
                    height={"2rem"} 
                    color={'#36752f'} 
                    onClick={() => {
                        announce(OnlineAs);
                    }}
                >
                        Go Online
                </Button>
                </ButtonWrapper>
                <ButtonWrapper>
                <Button 
                height={"2rem"} 
                color={'#36752f'} 
                onClick={() => depart()}>
                    Go Offline
                </Button>
                </ButtonWrapper>
            </OnlineWrapper>
        </ConnectionWrapper>

    )
}
export default ServerConnection
