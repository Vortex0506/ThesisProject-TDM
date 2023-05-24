
import React, { useEffect } from 'react';
import { EventUI } from "./EventUI";
import { Stage, Layer, Rect, Text } from 'react-konva';
import { Event, UiRelation, RelationType, UiEvent, Identifiable, isUiDCRGraph, State, Change, isRelation, Invite, UiDCRGraph, ActiveUser, DCRGraph, EventMap, Marking, Test, AlignAction } from 'types';
import { useToasts } from 'react-toast-notifications'
import { v4 as uuidv4 } from 'uuid';

import TestBar from './TestBar';
import { ContextMenuTrigger } from "react-contextmenu";
import DesignerContextMenu from './DesignerContextMenu';
import "web/src/styling/react-contextmenu.css"
import { calculateArrowUsingAngles, calculateInitialAngle, getNewPosition } from './../helpers/Calculations';
import { RelationArrow } from './RelationArrow';
import BackButton from "./ui/BackButton";
import { useSwarmContext } from '../helpers/SvarmProvider';
import { useCollaboratorClientContext } from '../helpers/CollaboratorClientProvider';
import { useServerConnectionContext } from "../helpers/ServerConnectionProvider";
import InviteButton from './ui/InviteButton';
import InvitePeerModal from './InvitePeerModal';
import EventEditModal from "./EventEditModal";
import ActiveTrace from './ActiveTrace';
import ActiveContext from './ActiveContext';

import align from './align';
import { graphToGraphPP, DCRtoLabelDCR } from './utility';
import init from './init';

type DesignerProps = {
  setState: (state: State) => void;
  id: string | null;
}

const Designer = ({ setState, id }: DesignerProps) => {
  const { addToast } = useToasts();
  const [graphId, setGraphId] = React.useState<string>( id ? id : uuidv4() );
  const [events, setEvents] = React.useState<UiEvent[]>([]);
  const [count, setCount] = React.useState(0);
  const [relations, setRelations] = React.useState<UiRelation[]>([]);
  const [newRelations, setNewRelations] = React.useState<UiRelation[]>([]);
  const [isRelationDrawing, setIsRelationDrawing] = React.useState(0);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [selectedRelationId, setSelectedRelationId] = React.useState<string>("");
  const [selectedObject, setSelectedObject] = React.useState<any>(null);
  const [eventEditing, setEventEditing] = React.useState<UiEvent>();
  const [inviteModalOpen, setInviteModalOpen] = React.useState<boolean>(false);
  //Extension test system
  const [formalDCR, setFormalDCR] = React.useState<DCRGraph>();
  const [activeTrace, setTrace] = React.useState<UiEvent[]>([]);
  const [activeContext, setContext] = React.useState<Set<UiEvent>>(new Set());
  const [tests, setTests] = React.useState<Test[]>([]); 
  const [polarityTest, setPolariy] = React.useState<string>("pos");
  const [testsOpen, setTestsOpen] = React.useState<boolean>(false);



  var uniqid = require('uniqid');

  const { changes, acceptChange, sendChange } = useSwarmContext();
  const { sendInvite } = useCollaboratorClientContext();
  const { announcedName, id: userId, isOnline } = useServerConnectionContext();

  useEffect(() => {
    window.electron.listenToToast((msg: { msg: string, appearance: "success" | "error" }) => {
      const content = msg.msg;
      const appearance = msg.appearance;
      addToast(content, {
        appearance,
        autoDismiss: true
      });
    });
    return () => {
      window.electron.clearToastListener();
    }
  }, [addToast])

  useEffect(() => {
    window.electron.listenToGetGraph(() => {
      const graph = {
        id: graphId,
        events: events,
        relations: relations
      }
      window.electron.sendGraph(JSON.stringify(graph));
    });
    window.electron.listenToShowGraph((graph: any) => {
      console.log("Showing graph")
      if (isUiDCRGraph(graph)) {
        setGraphId(graph.id);
        setEvents(graph.events);
        setRelations(graph.relations);
        setCount(graph.events.length + graph.relations.length);
        setNewRelations([]);
        setIsRelationDrawing(0);
        setSelectedObject(null);
        console.log("GRAPH CREATED");
        console.log(graph.id);
      }
    });
    return () => {
      window.electron.clearGraphListeners();
    }
  }, [events, relations, graphId]);

  const addChange = (changes: Array<{object: UiEvent | UiRelation, removed: boolean}>) => {
    const newChange: Change = {
      id: uuidv4(),
      timestamp: new Date(),
      payload: changes.map((change) =>  {
        return {
          object: change.object,
          type: isRelation(change.object) ? "relation" : "event",
          removed: change.removed,
        }
      })
    }
    sendChange(graphId, newChange); //this function comes from the swarm context, but it is still used in the solo editing line 183 (addEvent) ?
  }

  //I think all belows is swarm funcitonality  

  const applyElemChange = <T extends UiRelation | UiEvent>(arr: Array<T>, removed: boolean, object: T) => {
    // If element doesn't exist create it with the object
    const id = object.id;
    if (arr.findIndex((x) => x.id === id) === -1) {
      arr.push(object as T);
      return;
    }
    // Remove element
    let elem = removeElement(arr, id);
    // If elem should not be removed, apply the object and add it again
    if (!removed) {
      elem = {...elem, ...object }
      arr.push(elem);
    }
  }

  const applyChange = (change: Change) => {
    if (change.payload[0].type === "graph") {
      console.log("getting initial graph");
      const graph = change.payload[0].object as UiDCRGraph;
      setEvents(graph.events);
      setRelations(graph.relations);
      return
    }
    const relationsCp = [...relations];
    const eventsCp = [...events];
    for (const elem of change.payload) {
      if (elem.type === "event") {
        applyElemChange(eventsCp, elem.removed, elem.object as UiEvent | UiRelation);
      } else {
        applyElemChange(relationsCp, elem.removed, elem.object as UiEvent | UiRelation);
      }
    }
    setEvents(eventsCp);
    setRelations(relationsCp);
  }

  useEffect(() => {
    if (changes[graphId]) {
      for (const change of changes[graphId]) {
        applyChange(change);
        acceptChange(graphId, change.id);
      }
    }
  }, [changes, events, relations, acceptChange, graphId])

  //I think above all swarm context functionality
  //I think below all local graph editing

  const addEvent = (e: any) => {
    let stage = e.target.getStage();
    const event = {
      id: uniqid('event-'),
      name: "Event: " + count.toString(),
      description: "Description",
      show_in_graph: true,
      position: {
        x: stage.getPointerPosition().x,
        y: stage.getPointerPosition().y,
      },
      size: {
        height: 200,
        width: 100
      },
      is_enabled: false,
      is_executed: false,
      is_excluded: false,
      is_pending: false,
      isDragging: false,
      relationStart: [],
      relationEnd: []
    };

    setCount(
      count + 1
    );

    addChange([{object: event, removed: false}]);
    setEvents([...events, event]);
  }

  const removeEvent = (e: any) => {
    const id = e.target.parent.id();

    // Remove relations associated with the event.
    const { alteredObjects, eventsCp } = removeEventRelations(id);
    const removedElement = removeElement(eventsCp, id);
    setEvents(eventsCp)

    // Add changes (both removed event and relations)
    addChange([...alteredObjects.map((obj) => {
      return {
        object: obj,
        removed: isRelation(obj), // Relations are removed, events are being altered
      }
    }), {object: removedElement, removed: true}])
  };

  // Input the id of the event being removed
  // This returns all objects altered, and a copy of the events array that has (potentially) been altered
  // This is needed since setState is async, and we can't guarantee that it would finish at the bottom
  // of this function before we would like to use it again to remove the event
  const removeEventRelations = (id: string): {alteredObjects: Array<UiRelation | UiEvent>, eventsCp: Array<UiEvent> } => {
    const relationsCp = [...relations];
    const eventsCp = [...events];
    let relationsToRemove: string[] = [];
    let alteredEvents: UiEvent[] = [];
    relationsCp.forEach(function (relation) {
      if (relation.start_event_id === id) {
        relationsToRemove.push(relation.id);
        eventsCp.forEach((event) => {
          event.relationEnd.forEach(function (element, index) {
            if (element === relation.id) {
              alteredEvents.push(event);
              event.relationEnd.splice(index, 1);
            }
          });
        });


      }
      if (relation.end_event_id === id) {
        relationsToRemove.push(relation.id);
        eventsCp.forEach((event) => {
          event.relationStart.forEach(function (element, index) {
            if (element === relation.id) {
              alteredEvents.push(event);
              event.relationStart.splice(index, 1);
            }
          });
        });

      }
    });

    let relationsRemoved = relationsToRemove.map((id) => relationsCp.find((relation => relation.id === id)));
    const relationsRemovedFilter = relationsRemoved.filter((elem) => isRelation(elem)) as Array<UiRelation>;

    relationsToRemove.forEach((rel) => {
      removeElement(relationsCp, rel);
    })
    setRelations(relationsCp);
    return { alteredObjects: [...alteredEvents, ...relationsRemovedFilter], eventsCp }
  };

  // -------------- Comment ---------------
  // This function uses weird side effects. Consider refactoring
  //  -----------------------------         -Axel 07/06/2021
  const removeRelation = (e: any) => {
    const id = e.target.id();
    const localChanges: Array<{ object: UiEvent | UiRelation, removed: boolean }> = [];
    // Remove relation
    const relationsCp = [...relations];
    let remRelation = removeElement(relationsCp, id);
    setRelations(relationsCp);
    localChanges.push({object: remRelation, removed: true});
    const eventsCp = [...events];
    // Remove from start event's list of start relations
    let event = findElement(eventsCp, remRelation.start_event_id)
    removeElementFromArray(event.relationStart, remRelation.id)
    let newEvent = {...event};
    localChanges.push({object: newEvent, removed: false});

    // Remove from end event's list of end relations
    event = findElement(eventsCp, remRelation.end_event_id);
    removeElementFromArray(event.relationEnd, remRelation.id);
    newEvent = {...event};
    localChanges.push({object: newEvent, removed: false});
    
    addChange(localChanges);
    setEvents(eventsCp);
  }
  //extended by test type - should not give side effects
  function removeElement<T extends UiRelation | UiEvent | Test>(someData: T[], id: string): T { //just be aware that someData is not the state itself as it is modified directly
    let index = someData.findIndex((elem) => elem.id === id);
    let element = someData[index];
    if (index >= 0) {
      someData.splice(index, 1);
    }
    return element;
  }

  function removeElementFromArray(someData: string[], str: string) {
    let index = someData.findIndex((elem) => elem === str);
    if (index >= 0) {
      someData.splice(index, 1);
    }
  }

  const handleDragStart = (e: any) => {
    const id = e.target.id();
    setEvents(
      events.map((event) => {
        return {
          ...event,
          isDragging: event.id === id,
        };
      })
    );
  };

  const handleDragEnd = (e: any) => {
    const localChanges = recalculateArrowLocations(e);
    addChange([{object: findElement(events, e.target.id()), removed: false}, ...localChanges]);
    setEvents(
      events.map((event) => {
        return {
          ...event,
          isDragging: false,
        };
      })
    );
  };

  const handleMouseDown = (relationType: RelationType, e: any) => {
    const NUMBER_OF_EVENTS_NEEDED = 1;
    if (isEvent(e) && events.length >= NUMBER_OF_EVENTS_NEEDED) {
      if (newRelations.length === 0) {
        const newRelation: UiRelation = {
          id: uniqid('relation-'),
          start_position: {
            x: e.target.parent.x() + e.target.parent.width() / 2,
            y: e.target.parent.y() + e.target.parent.height() / 2,
          },
          start_angle: 180,
          end_position: {
            x: e.target.parent.x() + e.target.parent.width() / 2,
            y: e.target.parent.y() + e.target.parent.height() / 2,
          },
          start_event_id: e.target.parent.id().toString(),
          end_event_id: e.target.parent.id().toString(),
          end_angle: 180,
          type: relationType
        };
        setNewRelations([newRelation]);

        // start rectangle
        const cpEvents = [...events];
        let event = findElement(cpEvents, e.target.parent.id());
        event.relationStart.push(newRelation.id);
        setEvents(cpEvents);
      }
    }
  };

  const handleMouseUp = (e: any) => {
    if (isEvent(e)) {
      if (newRelations.length === 1) {
        const relationToAdd: UiRelation = {...newRelations[0]};
        relationToAdd.end_event_id = e.target.parent.id();
        let startEvent = findElement(events, relationToAdd.start_event_id);
        let endEvent = findElement(events, relationToAdd.end_event_id);
        if (startEvent.id !== endEvent.id) {
          relationToAdd.start_angle = calculateInitialAngle(startEvent, endEvent)[0];
          relationToAdd.end_angle = calculateInitialAngle(startEvent, endEvent)[1];
          let new_angles = iterate(startEvent, endEvent, relationToAdd.start_angle, relationToAdd.end_angle);
          relationToAdd.start_angle = new_angles.start;
          relationToAdd.end_angle = new_angles.end;
          let points = calculateArrowUsingAngles(startEvent, endEvent, relationToAdd);
          relationToAdd.start_position.x = points[0];
          relationToAdd.start_position.y = points[1];
          relationToAdd.end_position.x = points[2];
          relationToAdd.end_position.y = points[3];
        } else {
          relationToAdd.start_position.x = startEvent.position.x;
          relationToAdd.start_position.y = startEvent.position.y;
          relationToAdd.end_position.x = startEvent.position.x;
          relationToAdd.end_position.y = startEvent.position.y;
        }
        const localChanges: Array<{object: UiEvent | UiRelation, removed: boolean}> = [];
        const relationsCp = [...relations];
        relationsCp.push(relationToAdd);
        setNewRelations([]);
        setRelations(relationsCp);
        setIsRelationDrawing(0);
        localChanges.push({object: relationToAdd, removed: false});
        // end rectangle
        const cpEvents = [...events];
        let event = findElement(cpEvents, e.target.parent.id());
        event.relationEnd.push(relationToAdd.id);
        setEvents(cpEvents);
        localChanges.push({object: event, removed: false});

        addChange(localChanges);
      }
    }
  };


  function iterate(start_event: any, end_event: any, start_angle_new: number, end_angle_new: number): any {
    let changeMade = false;
    relations.forEach((relation) => {
      if (relation.start_event_id === start_event.id && relation.end_event_id === end_event.id) {
        //Same direct arrow between same events
        if (relation.start_angle === start_angle_new) {
          //Same start angle
          start_angle_new = start_angle_new + 15;
          changeMade = true;

        }
        if (relation.end_angle === end_angle_new) {
          //Same start angle
          end_angle_new = end_angle_new - 15;
          changeMade = true;
        }
      }
      else if (relation.end_event_id === start_event.id && relation.start_event_id === end_event.id) {
        //Same direct arrow between same events
        if (relation.start_angle === end_angle_new && relation.end_angle === start_angle_new) {
          //Same start angle
          start_angle_new = start_angle_new + 15;
          end_angle_new = end_angle_new - 15;
          changeMade = true;

        }
      }


    });
    if (changeMade) {
      return iterate(start_event, end_event, start_angle_new, end_angle_new);
    }
    return { start: start_angle_new, end: end_angle_new };
  };
  const handleMouseMove = (e: any) => {
    if (newRelations.length === 1) {
      const { x, y } = e.target.getStage().getPointerPosition();
      const newRelation = {...newRelations[0]};
      newRelation.end_position.x = x;
      newRelation.end_position.y = y;
      setNewRelations([newRelation]);
    }
  };

  const createRelation = (relationType: RelationType, e: any) => {
    const NUMBER_OF_EVENTS_NEEDED = 1;
    if (isEvent(e) && events.length >= NUMBER_OF_EVENTS_NEEDED) {
      if (isRelationDrawing === 0) {
        setIsRelationDrawing(isRelationDrawing + 1);
        handleMouseDown(relationType, e);
      }
      else if (isRelationDrawing === 2) {
        setIsRelationDrawing(0);
      }
    }
  }

  function findElement<T extends Identifiable>(someData: T[], id: string): T {
    const retval = someData.find(element =>
      element.id === id);
    if (!retval) {
      throw new Error("Graph Desynchronization Error");
    }
    return retval
  }

  // little helper function
  function isEvent(e: any) {
    return e.target.className === Rect || (e.target.className === Text && e.target.parent.children[0].className === Rect)
  }

  const openEventEditModal = (e: any) => {
    const cpEvents = [...events];
    const cpEvent = findElement(cpEvents, e.target.parent.id());

    // modal is open when eventEditing !== undefined
    setEventEditing(cpEvent);
  }

  const closeEventEditModal = (id: string, name: string, description: string) => {
    // no parameters are passed when cancel is clicked
    if (id !== undefined) {
      const cpEvents = [...events];
      const cpEvent = findElement(cpEvents, id);
      cpEvent.name = name;
      cpEvent.description = description;
      addChange([{object: cpEvent, removed: false}]);
      setEvents(cpEvents);
    }

    // modal closes when eventEditing === undefined
    setEventEditing(undefined);
  }

  const openInviteModal = () => {
    setInviteModalOpen(true);
  }

  const handleSendInvite = (user: ActiveUser) => {
    // no parameters are passed when cancel is clicked
    console.log("sending to " + JSON.stringify(user));
    if (isOnline) {
      //LOGIC
      const invite: Invite = { uiDCRGraphId: graphId, 
        peerIp: user.ip, 
        peerPort: user.port.toString(),
        userId: userId,
        userName: announcedName
      }
      sendInvite(invite);
      addToast("Invite sent", { appearance: "success", autoDismiss: true });
    } else {
      addToast("You're offline", { appearance: "error", autoDismiss: true});
    }
  }

  const closeInviteModal = () => {
    setInviteModalOpen(false);
  }

  // stores new dimensions and size of an event after transform + recalculates the arrow position
  const updateOnEventResize = (e: any, dimensions: any) => {
    const id = e.target.id();
    const cpEvents = [...events];

    const cpEvent = removeElement(cpEvents, id);
    // update event points
    cpEvent.position.x = dimensions.x;
    cpEvent.position.y = dimensions.y;
    cpEvent.size.height = dimensions.height;
    cpEvent.size.width = dimensions.width;
    cpEvents.push(cpEvent);
    const localChanges = recalculateArrowLocations(e);
    setEvents(cpEvents);
    addChange([{object: cpEvent, removed: false}, ...localChanges]);
  }

  const updatePoints = (e: any) => {
    const id = e.target.id();
    const cpEvents = [...events];

    const cpEvent = findElement(cpEvents, id);
    // update event points
    cpEvent.position.x = e.target.x();
    cpEvent.position.y = e.target.y();

    recalculateArrowLocations(e);
    setEvents(cpEvents);
  }

  function onRelationDragEnd(e: any) {
    const relationsCp = [...relations];
    let relId = e.currentTarget.attrs.id.split(".")[0];
    let position = e.currentTarget.attrs.id.split(".")[1];
    let relation = findElement(relationsCp, relId);
    let start_event = findElement(events, relation.start_event_id);
    let end_event = findElement(events, relation.end_event_id);
    let circleCoord = { x: e.currentTarget.attrs.x, y: e.currentTarget.attrs.y };

    if (position === "start") {
      let points = getNewPosition(start_event, circleCoord);
      relation.start_position.x = points.x;
      relation.start_position.y = points.y;
      relation.start_angle = points.angle;
    }
    else {
      let points = getNewPosition(end_event, circleCoord);
      relation.end_position.x = points.x;
      relation.end_position.y = points.y;
      relation.end_angle = points.angle;
    }

    setRelations(relationsCp);
  }

  const recalculateArrowLocations = (e: any) => {
    const id = e.target.id();
    const cpRelations = [...relations];
    const event = findElement(events, id);
    const localChanges: Array<{object: UiEvent | UiRelation, removed: boolean}> = [];
    // update relation points
    event.relationStart.forEach((relationID: string) => {
      let relation = findElement(cpRelations, relationID);
      let endEvent = findElement(events, relation.end_event_id);
      if (event.id === endEvent.id) {
        relation.start_position.x = event.position.x;
        relation.start_position.y = event.position.y;
        relation.end_position.x = event.position.x;
        relation.end_position.y = event.position.y;
      } else {
        let points = calculateArrowUsingAngles(event, endEvent, relation);
        relation.start_position.x = points[0];
        relation.start_position.y = points[1];
        relation.end_position.x = points[2];
        relation.end_position.y = points[3];
      }
      localChanges.push({object: relation, removed: false});
    });
    event.relationEnd.forEach((relationID: string) => {
      let relation = findElement(cpRelations, relationID);
      let startEvent = findElement(events, relation.start_event_id);
      if (event.id !== startEvent.id) {
        let points = calculateArrowUsingAngles(startEvent, event, relation);
        relation.start_position.x = points[0];
        relation.start_position.y = points[1];
        relation.end_position.x = points[2];
        relation.end_position.y = points[3];
        localChanges.push({object: relation, removed: false});
      }
    });
    
    setRelations(cpRelations);
    return localChanges;
  }

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedEventId("");
      setSelectedRelationId("");
    }
  };

  const ChangeMarking = (marking: string, e: any) => {
    const cpEvents = [...events];
    let event = findElement(cpEvents, e.target.parent.id());
    switch (marking) {
      case "Executed":
        event.is_executed = !event.is_executed;
        break;
      case "Pending":
        event.is_pending = !event.is_pending;
        break;
      case "Included":
        event.is_excluded = !event.is_excluded;
        break;
      default:
        return
    }
    setEvents([...cpEvents]);

    addChange([{object: event, removed: false}]);
  }

//Testing leon: 
  function testMyShit1(rdict: EventMap){
    rdict["1"] = new Set<string>(["ein object wird verändertt"])
  }
  function testMyShit(){
    //const cpEvents = [...events];
    //const eventList = ["Trace:"];
    //const contextList = ["Context:", "EInEvent"]
    //cpEvents.map((event)=>{
    //  eventList.push(event.name)  
    //})
    //setTestList(eventList); 
    //console.log(eventList);
    //setTestNestedList([[eventList, contextList],[eventList,contextList]]);
    console.log(activeContext);
    console.log(activeTrace);
    console.log(tests);

  }

//Below: Test-System extension

  //refactor, if should be uselss as all sets inilaized in createFormalDCR
   const getRelationTo = (relDict: EventMap, rel: UiRelation) =>{ 
    if (relDict[rel.start_event_id] === undefined){
      relDict[rel.start_event_id] = new Set<string>([rel.end_event_id]);
    }
    else {
      const toAdd = new Set<string>();
      toAdd.add(rel.end_event_id)
      toAdd.forEach(relDict[rel.start_event_id].add, relDict[rel.start_event_id]);
    }
  }

  const getRelationFor = (relDict: EventMap, rel: UiRelation) =>{ 
    if (relDict[rel.end_event_id] === undefined){
      relDict[rel.end_event_id] = new Set<string>([rel.start_event_id]);
    }
    else {
      const toAdd = new Set<string>();
      toAdd.add(rel.start_event_id)
      toAdd.forEach(relDict[rel.end_event_id].add, relDict[rel.end_event_id]);
    }
  }

  const createFormalDCR = () => {
    init(); //Initialize everything needed for align algroithm
    //Below: data is extracted for events and marking.
    const cpEvents = [...events];
    //instanziating sets needed for events and marking in the formal graph
    const eventSet = new Set<string>();
    const pendingSet = new Set<string>();
    const includedSet = new Set<string>();
    const executedSet = new Set<string>();
    
    //Instantziating the dictonaries
    const newConditionsFor: EventMap = {};
    const newMilestonesFor: EventMap = {};
    const newResponseTo: EventMap = {};
    const newIncludesTo: EventMap = {};
    const newExcludesTo: EventMap = {};
   
    //mapping over events in order to get marking and all event ids
    /*While doing that also instanziate a empty set for every relation for a event.
      This is needed as the allignment algorithm optimizations will check every event relation.
      It cannot be undefined! */
    cpEvents.map((event) => {
      eventSet.add(event.id)
      if (event.is_executed === true){
        executedSet.add(event.id);
      }
      if (event.is_pending === true){
        pendingSet.add(event.id);
      }
      if (event.is_excluded ===false){ 
        includedSet.add(event.id);
      }
      newConditionsFor[event.id]= new Set<string>();
      newMilestonesFor[event.id]= new Set<string>();
      newResponseTo[event.id]= new Set<string>();
      newIncludesTo[event.id]= new Set<string>();
      newExcludesTo[event.id]= new Set<string>();
    })
    const newMarking: Marking = {
      pending: pendingSet,
      included: includedSet,
      executed: executedSet
    }

    //Below: data extraction for relations.
    const cpRelations = [...relations];
    //mapping over relation to get relations for each event
    cpRelations.map((relation) => {
      if(relation.type === "conditionsFor"){
        getRelationFor(newConditionsFor, relation);
      }
      else if (relation.type === "milestonesFor"){
        getRelationFor(newMilestonesFor, relation);
      }
      else if(relation.type === "responseTo"){
        getRelationTo(newResponseTo, relation);
      }
      else if(relation.type === "includesTo"){
        getRelationTo(newIncludesTo, relation); 
      }
      else if (relation.type === "excludesTo"){
        getRelationTo(newExcludesTo, relation);
      }

    })

    const formalDCRGraph: DCRGraph = {
      events: eventSet,
      conditionsFor: newConditionsFor,
      milestonesFor: newMilestonesFor,
      responseTo: newResponseTo,
      includesTo: newIncludesTo,
      excludesTo: newExcludesTo,
      marking: newMarking 
    }

    setFormalDCR(formalDCRGraph); 
  }

  const addToTrace = (e:any) => {
    const cpEvents = [...events];
    const event = findElement(cpEvents, e.target.parent.id());
    setTrace([...activeTrace,event]); 

  }
  const removeFromTrace = (e:any) => {
    const id = e.target.parent.id();
    const cpActiveTrace = [...activeTrace];
    removeElement(cpActiveTrace, id);
    setTrace(cpActiveTrace);

  }
  const addToContext = (e:any) => {
    const cpEvents = [...events];
    const event = findElement(cpEvents, e.target.parent.id());
    const cpActiveContext = new Set(activeContext)
    setContext(cpActiveContext.add(event)); 
  }
  const removeFromContext = (e:any) => {
    const id = e.target.parent.id();
    const cpActiveContext = new Set(activeContext);
    cpActiveContext.delete(id);
    setContext(cpActiveContext);
  }

  const submitTest = () => {
    const cpActiveTrace = [...activeTrace];
    const cpActiveContext = new Set(activeContext);
    if (cpActiveTrace.length != 0 && cpActiveContext.size != 0){
      const finishedTest: Test = {
        id: uniqid('test-'),
        trace: cpActiveTrace,
        context: cpActiveContext,
        polarity: polarityTest,
        deleted: false,
        passes: -1 //-1 = default not executed, 0 = false, 1 = true
      }
      const cpTests= [...tests];
      setTests([...cpTests, finishedTest]);
      setTrace([]);
      setContext(new Set())
    }
  }

  const executeTests = () => {
    console.log("Syntactical Checks to be implemented")
    //logDCR();
    modelChecking();
  }

  const modelChecking = () => {
      const cpFormalDCR = formalDCR
      const optFormalGraph = graphToGraphPP(cpFormalDCR as DCRGraph);
      const labeledFormalDCR = DCRtoLabelDCR(optFormalGraph);

      tests.map((test)=>{

        const cpTrace: Event[] = [];
        test.trace.map((event) => {
          cpTrace.push(event.id);
        });

        const contextAsArray = Array.from(test.context); 
        const cpContext: Event[] = []; 
        contextAsArray.map((event) => {
          cpContext.push(event.id);
        })

        const costFunction = (action:AlignAction, target: Event) => {
          switch(action){
            case "consume":
              console.log("consume  " + target);
              return 0;
            case "model-skip":
              console.log("model-skip  " + target);
              if(cpContext.includes(target)) {
                console.log("target in context -> Infinity")
                return Infinity;
              } else {
                return 0; 
              }
            case "trace-skip":
              console.log("trace-skip  " + target);
              return Infinity;
          }
        }
        const allignmentFound = align(cpTrace, labeledFormalDCR, costFunction, 100);
        
        //console.log("cost" + allignmentFound.cost);
        //console.log(allignmentFound.trace.length);
        //allignmentFound.trace.map((e) => {
        //  console.log(e);
        //})

        if(allignmentFound.cost == Infinity){
          if(test.polarity == "pos"){
            test.passes = 0;
          } else {
            test.passes = 1; 
          }
        } else {
          if (test.polarity == "pos"){
            test.passes = 1;
          }
          else{
            test.passes = 0;
          }
        }

      });

  }

  const clearActiveTest = () => {
    setTrace([]);
    setContext(new Set());
  }

  const clearAllTest = () => {
    setTests([]);
  }

  const deleteTest = (id:string) => {
    const testToRemove = id;
    const cpTests = [...tests];
    removeElement(cpTests, testToRemove);
    setTests(cpTests);

  }

  const deleteLastTrace = (idTest: string) => {
    const cpTests = [...tests]
    const cpTest = findElement(cpTests, idTest);
    const cpTrace = cpTest.trace;
    cpTrace.pop();
    cpTest.trace = cpTrace; 
    const indexTest = cpTests.findIndex((elem) => elem.id === idTest);
    removeElement(cpTests, idTest);
    cpTests.splice(indexTest, 0, cpTest)
    setTests([...cpTests]);

  }

  const deleteLastContext = (idTest: string) => {
    const cpTests = [...tests]
    const cpTest = findElement(cpTests, idTest);
    const cpContext = cpTest.context;
    const contextAsArray = Array.from(cpContext);
    contextAsArray.pop();
    cpTest.context = new Set(contextAsArray); 
    const indexTest = cpTests.findIndex((elem) => elem.id === idTest);
    removeElement(cpTests, idTest);
    cpTests.splice(indexTest, 0, cpTest)
    setTests([...cpTests]);
  }


  const logDCR = () =>{
    const cpEvents = [...events];
    const cpFormalDCR = formalDCR;
    const cpRelations = [...relations];
    cpEvents.map((event) => {
      console.log("ID:");
      console.log(event.id);
      console.log("name:");
      console.log(event.name);
      console.log("---------");
    })
    //console.log("events formal graph:")
    //console.log(cpFormalDCR?.events);
    console.log("marking formal graph:")
    console.log("pending:")
    console.log(cpFormalDCR?.marking.pending);
    console.log("included:")
    console.log(cpFormalDCR?.marking.included);
    console.log("executed:")
    console.log(cpFormalDCR?.marking.executed);

    //console.log("conditionsFor:")
    //for (const e in cpFormalDCR?.conditionsFor){
    //  console.log(e)
    //}
    //console.log("relations:")
    //cpRelations.map((relation) => {
    //  console.log(relation.start_event_id);
    //  console.log(relation.end_event_id);
    //  console.log(relation.id);
    //})
    //console.log("relations formal graph")
    //cpEvents.map((event) => {
    //  console.log("relation for event:")
    //  console.log(event.id)
    //  console.log("ConditionFor:")
    //  console.log(cpFormalDCR?.conditionsFor[event.id])
    //  console.log("MilestoneFor:")
    //  console.log(cpFormalDCR?.milestonesFor[event.id])
    //  console.log("ResponseTo:")
    //  console.log(cpFormalDCR?.responseTo[event.id])
    //})

  }


  //<button onClick={clearAllTest}> Clear all Tests</button>
  //<button onClick={testMyShit}> TestThings</button>
  //<br />
  //<button onClick={createFormalDCR}> create formal DCR</button>
  //     <button onClick={logDCR}> log formal DCR</button>
  //<button onClick={createFormalDCR}> create formal DCR</button>
  //<br />
  //<button onClick={logDCR}> log formal DCR</button>

  return (
    <div>
      <BackButton onClick={() => setState("LandingPage")} />
      <InviteButton onClick={() => openInviteModal()} />
      
      <ActiveTrace givenTrace={activeTrace}/>
      <ActiveContext givenContext={activeContext}/>
      
      <button onClick={submitTest}> Submit Test</button>
      <button onClick={clearActiveTest}> Clear active Test</button>
      
      <input type="radio" name="polarityTest" value="pos" onChange={e=> setPolariy(e.target.value)} /> Positive-Test
      <input type="radio" name="polarityTest" value="neg" onChange={e=> setPolariy(e.target.value)} /> Negative-Test
      <ContextMenuTrigger id="contextmenu" holdToDisplay={-1}>
        <Stage width={window.innerWidth} height={window.innerHeight}
          onMouseUp={handleMouseUp}
          onClick={checkDeselect}
          onMouseMove={handleMouseMove}
          onContextMenu={setSelectedObject}>
          <Layer>
            {relations.map((relation) => (
              <RelationArrow
                key={relation.id}
                relationProps={relation}
                isRelationSelected={relation.id === selectedRelationId}
                onSelect={() => {
                  setSelectedRelationId(relation.id);
                }}
                onRelationDragEnd={onRelationDragEnd}
              />
            ))}
            {newRelations.map((relation) => (
              <RelationArrow key={relation.id} relationProps={relation}

              />
            ))}
            {events.map((event, i) => {
              return (
                <EventUI
                  key={event.id}
                  eventProps={event}
                  isSelected={event.id === selectedEventId}
                  onDragMove={updatePoints}
                  onSelect={() => {
                    setSelectedEventId(event.id);
                  }}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onChange={(newAttrs: UiEvent) => {
                    const changeEvents = events.slice();
                    changeEvents[i] = newAttrs;
                    addChange([{ object: newAttrs, removed: false }]);
                  }}
                  onTransformEndDes={updateOnEventResize}
                />
              );
            })}
          </Layer>
        </Stage>
        <TestBar 
          open={testsOpen} 
          setOpen={setTestsOpen} 
          tests={tests} 
          deleteTest={deleteTest} 
          deleteLastTrace={deleteLastTrace} 
          deleteLastContext={deleteLastContext} 
          executeTests={executeTests} 
          createFormalDCR={createFormalDCR}
        />
      </ContextMenuTrigger>
      <DesignerContextMenu
        selectedObject={selectedObject}
        isEvent={isEvent}
        createRelation={createRelation}
        editEvent={openEventEditModal}
        removeEvent={removeEvent}
        changeMarking={ChangeMarking}
        addEvent={addEvent}
        removeRelation={removeRelation}
        addToTrace={addToTrace}
        removeFromTrace={removeFromTrace}
        addToContext={addToContext}
        removeFromContext={removeFromContext}

      />
      {eventEditing !== undefined && (
        <EventEditModal 
          handleClose={closeEventEditModal}
          eventEditing={eventEditing}
          />
      )}
      {inviteModalOpen && (
        <InvitePeerModal sendInvite={handleSendInvite} close={closeInviteModal}/>
      )}
    </div>
  );
};

export default Designer;

//  function getEventAndMarking(){
//    const cpEvents = [...events];
//
//    const eventSet = new Set<string>();
//
//    const pendingSet = new Set<string>();
//    const includedSet = new Set<string>();
//    const executedSet = new Set<string>();
//
//    cpEvents.map((event) => {
//      eventSet.add(event.id)
//      if (event.is_executed === true){
//        executedSet.add(event.id);
//      }
//      if (event.is_pending === true){
//        pendingSet.add(event.id);
//      }
//      if (event.is_excluded ===false){ //is enabled=included?! I chose to go with, if smth is not exlcued, it is included by default
//        includedSet.add(event.id);
//      }
//    })
//    const newMarking: Marking = {
//      pending: pendingSet,
//      included: includedSet,
//      executed: executedSet
//    }
//    return [eventSet, newMarking]
//  } //Would prefer calling this function in createFormal DCR, but cant fix return types for 

//function createRelations(){
//  const cpRelations = [...relations];
//  const newConditionsFor: RelationDict = {};
//  const newMilestonesFor: RelationDict = {}
//  const newResponseTo: RelationDict = {}
//  const newIncludesTo: RelationDict = {}
//  const newExcludesTo: RelationDict = {}
//
//  cpRelations.map((relation) => {
//    if (relation.type === "conditionsFor"){
//      if(newConditionsFor[relation.start_event_id] === undefined){
//        newConditionsFor[relation.start_event_id] = new Set<string>([relation.id])
//      } 
//      else {
//        const toAddCond = new Set<string> ()
//        toAddCond.add(relation.id)
//        toAddCond.forEach(newConditionsFor[relation.start_event_id].add, newConditionsFor[relation.start_event_id]) 
//      }
//    //to be tested, might be that the set we call .forEach on is not instansiated yet
//    //desired functionality: we take the existing set/dict for the event ID and merge them with the new relation to be aded
//    //https://stackoverflow.com/questions/32000865/simplest-way-to-merge-es6-maps-sets
//    //https://livecodestream.dev/post/everything-you-should-know-about-javascript-dictionaries/
//    } 
//    else if (relation.type === "milestonesFor"){
//      const toAddMile = new Set<string> ()
//      toAddMile.add(relation.id)
//      newConditionsFor[relation.start_event_id].forEach(toAddMile.add, toAddMile)
//    }
//    else if(relation.type === "responseTo"){
//      const toAddResp = new Set<string> ()
//      toAddResp.add(relation.id)
//      newConditionsFor[relation.start_event_id].forEach(toAddResp.add, toAddResp)
//    } 
//    else if(relation.type === "includesTo"){
//      const toAddInc = new Set<string> ()
//      toAddInc.add(relation.id)
//      newConditionsFor[relation.start_event_id].forEach(toAddInc.add, toAddInc)
//    }
//    else if (relation.type === "excludesTo"){
//      const toAddEx = new Set<string> ()
//      toAddEx.add(relation.id)
//      newConditionsFor[relation.start_event_id].forEach(toAddEx.add, toAddEx)
//    } //Consider refactoring: helper function, same code each case. Pro: less duplicate code, Con: relation get passed
//
//    //when giving a objet as input, and we change this object in function, are the object changes kept in the original object
//    //Considering to have this if else statments in the formal DCR-graph function, calling helper function (duplicate code)
//    //and assigning the dict to the corresponding field.
//    //For marking and Event, we can merge into one mapping and then return touple.
//    //Where we refer to eaech of the return values when assigning field for formal dcr graph.
//  })  
//
//}