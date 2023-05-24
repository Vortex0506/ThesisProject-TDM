import { DCRGraph, EventMap, Marking, Event, Optimizations, LabelDCRPP, DCRGraphPP, Labelling } from 'types';

// Makes deep copy of a eventMap
export const copyEventMap = (eventMap: EventMap): EventMap => {
  const copy: EventMap = {};
  for (const startEvent in eventMap) {
    copy[startEvent] = new Set(eventMap[startEvent]);
  }
  return copy;
};

export const copySet = <T>(set: Set<T>): Set<T> => {
  return new Set(set);
};

export const copyMarking = (marking: Marking): Marking => {
  return {
    executed: copySet(marking.executed),
    included: copySet(marking.included),
    pending: copySet(marking.pending),
  };
};

export const reverseRelation = (relation: EventMap): EventMap => {
  const retRelation: EventMap = {};
  for (const e in relation) {
    retRelation[e] = new Set();
  }
  for (const e in relation) {
    for (const j of relation[e]) {
      retRelation[j].add(e);
    }
  }
  return retRelation;
};

export const graphToGraphPP = <T extends DCRGraph>(graph: T): T & Optimizations => {
  const conditions = new Set<Event>();
  for (const key in graph.conditionsFor) {
    conditions.union(graph.conditionsFor[key]);
  }
  return { ...graph, conditions, includesFor: reverseRelation(graph.includesTo), excludesFor: reverseRelation(graph.excludesTo) };
};

export const DCRtoLabelDCR = <T extends DCRGraph>(model: T): T & Labelling => {
  const labelMap: { [name: string]: string } = {};
  const labelMapInv: EventMap = {};

  for (const event of model.events) {
    labelMap[event] = event;
    labelMapInv[event] = new Set([event]);
  }

  const labelModel: T & Labelling = {
    ...model,
    labels: copySet(model.events),
    labelMap,
    labelMapInv
  }
  return labelModel;
}