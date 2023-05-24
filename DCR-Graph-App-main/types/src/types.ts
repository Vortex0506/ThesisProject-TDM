// ----------------------------------------------------------------------------------------------------------------
// ------------------------------------------------- TYPE GUARDS --------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

export const isStringArray = (obj: any): obj is Array<string> => {
    return obj.constructor === Array && (!obj[0] || typeof obj[0] === "string")
}

export const isCoords = (obj: any): obj is Coords => {
    return typeof obj.x === "number" && typeof obj.y === "number"
}

export const isDimensions = (obj: any): obj is Dimensions => {
    return typeof obj.height === "number" && typeof obj.width === "number"
}

export const isRelationType = (obj: any): obj is RelationType => {
    const relationSet = new Set(["conditionsFor", "milestonesFor", "responseTo", "includesTo", "excludesTo"]);
    return typeof obj === "string" && relationSet.has(obj);
}

export const isEvent = (obj: any): obj is UiEvent => {
    return (
        typeof obj.id === "string" &&
        typeof obj.name === "string" &&
        typeof obj.show_in_graph === "boolean" &&
        isCoords(obj.position) &&
        isDimensions(obj.size) &&
        typeof obj.is_enabled === "boolean" &&
        typeof obj.is_excluded === "boolean" &&
        typeof obj.is_executed === "boolean" &&
        typeof obj.is_pending === "boolean" &&
        typeof obj.isDragging === "boolean" &&
        isStringArray(obj.relationStart) &&
        isStringArray(obj.relationEnd)
    )
}

export const isRelation = (obj: any): obj is UiRelation => {
    return (
        typeof obj.id === "string" &&
        typeof obj.start_event_id === "string" &&
        isCoords(obj.start_position) &&
        typeof obj.end_event_id === "string" &&
        isCoords(obj.end_position) &&
        isRelationType(obj.type)
    )
}

export const isRelationArray = (obj: any): obj is Array<UiRelation> => {
    return obj.constructor === Array && (!obj[0] || isRelation(obj[0]))
}

export const isEventArray = (obj: any): obj is Array<UiEvent> => {
    return obj.constructor === Array && (!obj[0] || isEvent(obj[0]))
}

export const isUiDCRGraph = (obj: any): obj is UiDCRGraph => {
    return (
        typeof obj.id === "string" &&
        isRelationArray(obj.relations) &&
        isEventArray(obj.events)
    )
}

// Looks weird, for reasoning see comment at '__StateHelper'
export const isState = (obj: any): obj is State => {
    return obj in __StateHelper;
}

export function isPrimitive(obj: unknown): obj is number | string | boolean | null | undefined | bigint | symbol {
    return obj !== Object(obj);
}

export function isIterable(obj: any): obj is Iterable<unknown> {
        // checks for null and undefined
        if (!obj) {
          return false;
        }
        return typeof obj?.[Symbol.iterator] === 'function';
}

export function isChange(obj: any): obj is Change {
    return (
        typeof obj.id === "string" &&
        obj.payload.constructor === Array &&
        (isEvent(obj.payload[0].object) || isRelation(obj.payload[0].object) || isUiDCRGraph(obj.payload[0].object))
    )
}

export function isInvite(obj: any): obj is Invite {
    return (
        typeof obj.uiDCRGraphId === "string" &&
        typeof obj.peerIp === "string" &&
        typeof obj.peerPort === "string"
    )
}

export function isAccept(obj: any): obj is Accept {
    return (
        typeof obj.accept === "boolean"
    )
}

export function isIpPort(obj: any): obj is IpPort {
    return (
        typeof obj.ip === "string" && typeof obj.port === "number"
    )
}


// ----------------------------------------------------------------------------------------------------------------
// ------------------------------------------------ CONTROL TYPES -------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

// Dirty hack to make guard work. Other options were enums or composite types.
// Enums are weird, in that you get both objects and keys from either Object.keys or Object.values
//      this makes guards weird.
// Composite types can't be generically checked at runtime, making a non-hardcoded guard imposible.
const __StateHelper = {
    LandingPage: "landing-page",
    Canvas: "canvas",
}
export type State = keyof typeof __StateHelper;

// ----------------------------------------------------------------------------------------------------------------
// ------------------------------------------------ UTILITY TYPES -------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

export interface Coords {
    x: number;
    y: number;
}

export interface Dimensions {
    height: number;
    width: number;
}

export interface Identifiable {
    readonly id: string;
}

// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------- NETWORKING TYPES -----------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

export interface SwarmContextType {
    changes: {[graphId: string]: Array<Change>}, 
    acceptChange: (graphId: string, changeId: string) => void,
    sendChange: (graphId: string, change: Change) => void,
}

export interface CollaboratorClientContextType {
    sendInvite: (invite: Invite) => void
} 

export interface CollaboratorServerContextType {
    invites: Array<Invite>, 
    consumeInvite: (graphId: string) => void
}

export interface ActiveUser {
    id: string,
    name: string,
    ip: string,
    port: number
}

export interface ServerConnectionContextType {
    activeUsers: Array<ActiveUser>;
    refreshActiveUsers: () => void;
    announce: (username: string) => void;
    depart: () => void;
    isOnline: boolean;
    announcedName: string;
    id: string;
}

export interface IpPort {
    ip: string,
    port: number
}

// ----------------------------------------------------------------------------------------------------------------
// ------------------------------------------------- GRAPH TYPES --------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

export interface UiEvent {
    readonly id: string;
    name: string;
    description: string;
    show_in_graph: boolean;
    position: Coords;
    size: Dimensions;
    is_enabled: boolean;
    is_executed: boolean;
    is_excluded: boolean;
    is_pending: boolean;
    isDragging: boolean;
    relationStart: string[];
    relationEnd: string[];
}

export type RelationType = "conditionsFor" | "milestonesFor" | "responseTo" | "includesTo" | "excludesTo";

export interface UiRelation {
    readonly id: string;
    start_event_id: string;
    start_position: Coords;
    start_angle: number; // angle in degrees
    end_event_id: string;
    end_position: Coords;
    end_angle: number; // angle in degrees
    type: RelationType;

}

export interface UiDCRGraph {
    readonly id: string;
    dimensions: Dimensions;
    events: Array<UiEvent>;
    relations: Array<UiRelation>;
    changes?: Array<Change>;
    
    collaboration_id?: string;
}

// -----------------------------------------------------------
// -------------------- Extended Set Type --------------------
// -----------------------------------------------------------
//The types from line 234-250 are published under the GNU GPL v.3 liscence and are authored by Axel Kjeld Fjelrad Christfort

declare global {
    interface Set<T> {
      union(b: Set<T>): Set<T>;
      intersect(b: Set<T>): Set<T>;
      difference(b: Set<T>): Set<T>;
    }
  }
  
  // -----------------------------------------------------------
  // ------------------------ Alignment ------------------------
  // -----------------------------------------------------------
  
  export type AlignAction = "consume" | "model-skip" | "trace-skip";
  
  export type CostFun = (action: AlignAction, target: Event) => number;
  
  export type Alignment = { cost: number; trace: Trace };

// -----------------------------------------------------------
// ----------------- Formal DCR Graph Types ------------------
// -----------------------------------------------------------

//The types from line 256-257 are published under the GNU GPL v.3 liscence and are authored by Axel Kjeld Fjelrad Christfort
export type Event = string;
export type Label = string;

export interface Marking {
  executed: Set<Event>;
  included: Set<Event>;
  pending: Set<Event>;
}

// Map from event to a set of events
// Used to denote different relations between events
export interface EventMap {
  [startEventId: string]: Set<Event>;
}

export interface DCRGraph {
  events: Set<Event>;
  conditionsFor: EventMap;
  milestonesFor: EventMap;
  responseTo: EventMap;
  includesTo: EventMap;
  excludesTo: EventMap;
  marking: Marking;
}

//The types from line 282-311 are published under the GNU GPL v.3 liscence and are authored by Axel Kjeld Fjelrad Christfort
export interface Labelling { //Changes: Could not use type alias as Event and Label, had to use string
  labels: Set<Label>;
  labelMap: { [e: string]: string };
  labelMapInv: { [l: string]: Set<string> };
}

export interface Optimizations {
  conditions: Set<Event>;
  includesFor: EventMap;
  excludesFor: EventMap;
}

export type LabelDCR = DCRGraph & Labelling;

export type LabelDCRPP = LabelDCR & Optimizations;

export type DCRGraphPP = DCRGraph & Optimizations;

// -----------------------------------------------------------
// ----------------------- Test System -----------------------
// -----------------------------------------------------------

export interface Test  {
    readonly id: string;
    trace: UiEvent[];
    context: Set<UiEvent>; //set 
    polarity: string;
    deleted: boolean;
    passes: number; // -1 = default not executed, 0 = false, 1 = true
}



// ----------------------------------------------------------------------------------------------------------------
// ------------------------------------------------- CHANGE TYPES -------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------  

export interface Invite {
    uiDCRGraphId: string;
    userId: string;
    userName: string;
    peerIp: string;
    peerPort: string;
}

export interface Accept {
    accept: boolean;
}

export interface Change {
    id: string;
    timestamp: Date;
    userId?: string;
    payload: Array<{
        object: UiEvent | UiRelation | UiDCRGraph;
        type: "relation" | "event" | "graph";
        removed: boolean;
    }>;
}

export type Pair<T = UiRelation | UiEvent> = {oldObj: T | null, newObj: T | null}

// -----------------------------------------------------------
// ------------------------ Log Types ------------------------
// -----------------------------------------------------------
//The types from line 348-571 are published under the GNU GPL v.3 liscence and are authored by Axel Kjeld Fjelrad Christfort

export type Trace = Array<Event>;

type Traces = { [traceId: string]: Trace };

export interface EventLog {
  events: Set<Event>;
  traces: Traces;
}

export interface BinaryLog {
  events: Set<Event>;
  traces: Traces;
  nTraces: Traces;
}

export interface ClassifiedLog {
  [traceId: string]: {
    isPositive: boolean;
    trace: Trace;
  };
}

export interface ClassifiedTraces {
  [traceId: string]: boolean;
}

export interface XMLEvent {
  string: {
    "@key": "concept:name";
    "@value": string;
  };
}

export interface XMLTrace {
  string: {
    "@key": "concept:name";
    "@value": string;
  };
  boolean: {
    "@key": "pdc:isPos";
    "@value": boolean;
  };
  event: Array<XMLEvent>;
}

export interface XMLLog {
  log: {
    "@xes.version": "1.0";
    "@xes.features": "nested-attributes";
    "@openxes.version": "1.0RC7";
    global: {
      "@scope": "event";
      string: {
        "@key": "concept:name";
        "@value": "__INVALID__";
      };
    };
    classifier: {
      "@name": "Event Name";
      "@keys": "concept:name";
    };
    trace: Array<XMLTrace>;
  };
}

// Abstraction of the log used for mining
export interface LogAbstraction {
  events: Set<Event>;
  traces: {
    [traceId: string]: Trace;
  };
  chainPrecedenceFor: EventMap;
  precedenceFor: EventMap;
  responseTo: EventMap;
  predecessor: EventMap;
  successor: EventMap;
  atMostOnce: Set<Event>;
}

// Similar to EventMap, although this carries information about number of traces this Map has violated
export interface FuzzyRelation {
  [startEvent: string]: {
    [endEvent: string]: number;
  };
}
export type Metric = (tp: number, fp: number, tn: number, fn: number) => number;

// Alternate LogAbstraction that denotes how many times possible conditions are broken
// This can then be converted to a LogAbstraction through statistical analysis
export interface FuzzyLogAbstraction {
  events: Set<Event>;
  traces: {
    [traceId: string]: Trace;
  };
  chainPrecedenceFor: FuzzyRelation;
  precedenceFor: FuzzyRelation;
  responseTo: FuzzyRelation;
  predecessor: EventMap;
  successor: EventMap;
  atMostOnce: {
    [event: string]: number;
  };
  // Number of traces in which event has occurred
  eventCount: {
    [event: string]: number;
  };
}

export type FuzzyMetric = (
  traceViolations: number,
  traceCount: number,
  ...eventCounts: Array<number>
) => number;
// -----------------------------------------------------------
// --------------------- Petri Net Types ---------------------
// -----------------------------------------------------------

export type Place = string;
export type Transition = string;

// Places and Transitions MUST be disjoint
interface Net {
  places: Set<Place>;
  transitions: Set<Transition>;
  inputArcs: {
    [transition: string]: Set<Place>;
  };
  outputArcs: {
    [transition: string]: Set<Place>;
  };
  // Arcs from a transition to a Place, that clears all tokens in the Place
  resetArcs: {
    [transition: string]: Set<Place>;
  };
}

// Typeguard that enforces the constraints that are not possible to encode in the static type
// It runs through all places, transitions & arcs, and should therefore be used sparingly,
// e.g. once every time a Petri Net has been constructed
const isNet = (obj: any): obj is Net => {
  try {
    if (
      obj.places.constructor === Set &&
      obj.transitions.constructor === Set &&
      obj.arcs
    ) {
      // Check that all Transitions are strings
      for (const elem of obj.transitions) {
        if (typeof elem != "string") {
          return false;
        }
      }
      // Check that Places and Transitions are disjoint aswell as Places being strings
      for (const elem of obj.places) {
        if (typeof elem != "string" || obj.transitions.has(elem)) {
          return false;
        }
      }
      // Check that inputArcs are always Place -> Transition
      for (const end in obj.inputArcs) {
        if (!obj.transitions.has(end)) {
          return false;
        }
        for (const start of obj.inputArcs[end]) {
          if (!obj.places.has(start)) return false;
        }
      }
      // Check that outputArcs are always Transition -> Place
      for (const start in obj.outputArcs) {
        if (!obj.transitions.has(start)) {
          return false;
        }
        for (const end of obj.outputArcs[start]) {
          if (!obj.places.has(end)) return false;
        }
      }
      // Checks that resetArcs are always Transition -> Place
      for (const start in obj.resetArcs) {
        if (!obj.transitions.has(start)) {
          return false;
        }
        for (const end of obj.resetArcs[start]) {
          if (!obj.places.has(end)) return false;
        }
      }
      return true;
    } else return false;
  } catch (e) {
    // Something was of wrong type
    return false;
  }
};

export interface PetriMarking {
  [place: string]: number;
}

// Note that this definition does not consider arc multiplicity
// this means that any arc can only consume or create one token
export interface PetriNet {
  net: Net;
  marking: PetriMarking;
}

export const isPetriNet = (obj: any): obj is PetriNet => {
  const net = obj.net;
  if (isNet(net)) {
    try {
      for (const key in obj.marking) {
        if (!net.places.has(key) || typeof obj.marking[key] !== "number") {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  } else {
    console.log("Not Net");
    return false;
  }
};
