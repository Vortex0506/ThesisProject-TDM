import React, { useState, createContext, useContext, useEffect } from "react";

import { ActiveUser, IpPort, ServerConnectionContextType } from "types";

import { API_ENDPOINT } from "../constants";

const ServerConnectionContext = createContext<ServerConnectionContextType>({
    activeUsers: [],
    refreshActiveUsers: () => null,
    announce: (username: string) => null,
    depart: () => null,
    isOnline: false,
    announcedName: "",
    id: "",
});

export const ServerConnectionProvider: React.FC = ( { children } ) =>  {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [activeUsers, setActiveUsers] = useState<Array<ActiveUser>>([]);
    const [enteredName, setEnteredName] = useState<string>('');
    const [id, setId] = useState<string>('');
    const [pingTimeout, setPingTimeout] = useState<NodeJS.Timeout | null>(null);
    const TimeIntervalForPingingServer = 60000*5; //little less than 5 Minutes

    useEffect(() => { 
        window.electron.listenToNetwork( (msg: any) => {
            if (typeof msg.id === "string"){
                setId(msg.id);
            }else{
                setId('');
            }
        })
        handleLoad("networking.json");
    }, []);
    
    const handleLoad = (fn: string) => {
        window.electron.loadNetwork(fn);
    }
    const handleSave = (Content: string) => {
        window.electron.saveNetwork(Content);
    }

    const refreshActiveUsers = () =>{
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }
        fetch(API_ENDPOINT+'/api/DCRUser', requestOptions)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();
            if (!response.ok) {
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }
            if(response.ok){
                console.log(data);
                // This would filter yourself from active users. This, however, removes a showcasing opportunity
                // where you can have two peers on same computer
                // const filteredData = data.filter( (user: ActiveUser) => user?.id !== id);
                setActiveUsers(data);
                return Promise.resolve
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
        });
    }

    const announce = async (inputName:string) => {
        setEnteredName(inputName);
        console.log("announcing as: " + inputName);
        const { ip, port }: IpPort = await window.electron.getIpPort();
        console.log(ip + ":" + port);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({Id: id, Name: inputName, IP: ip, Port: port.toString()})
        }
        fetch(API_ENDPOINT+'/api/DCRUser', requestOptions)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();
            console.log("got response: " + data);
            if (!response.ok) {
                const error = (data && data.message) || response.status;
                if (error === 409){
                    setIsOnline(true);
                    if (pingTimeout) clearTimeout(pingTimeout);
                    setPingTimeout(setTimeout(refresh, TimeIntervalForPingingServer));
                    return Promise.resolve
                }
                return Promise.reject(error);
            }
            if(response.ok){
                const content = ''+data+','+inputName;
                handleSave(content);
                setIsOnline(true);
                if (pingTimeout) clearTimeout(pingTimeout);
                setPingTimeout(setTimeout(refresh, TimeIntervalForPingingServer));
                return Promise.resolve
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
        });
    }
    const refresh = () => {
        if (enteredName === undefined){
            return
        }
        ping(enteredName);
    }
    const ping = async (inputName:string) => {
        if (!isOnline){
            return
        }
        const { ip, port }: IpPort = await window.electron.getIpPort();
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({Id: id, Name: inputName, IP: ip, Port: port.toString() })
        }
        fetch(API_ENDPOINT+'/api/DCRUser/', requestOptions)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                setIsOnline(false);
                return Promise.reject(error);
            }
            if(response.ok){
                if (pingTimeout) clearTimeout(pingTimeout);
                setPingTimeout(setTimeout(refresh, TimeIntervalForPingingServer));
                setIsOnline(true);
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
        })
    };

    const depart = () =>{
        if (!isOnline){
            alert('You have to be online before you can go offline.');
            return;
        }
        fetch(API_ENDPOINT+'/api/DCRUser/'+ id, { method: 'DELETE' })
        .then(() => setIsOnline(false));
    } 
 
  
  return (
    <ServerConnectionContext.Provider value={{ activeUsers, refreshActiveUsers, announce, depart, isOnline, announcedName: enteredName, id }}>
      {children}
    </ServerConnectionContext.Provider>
  )
}

export const useServerConnectionContext = (): ServerConnectionContextType => {
  return useContext(ServerConnectionContext);
};