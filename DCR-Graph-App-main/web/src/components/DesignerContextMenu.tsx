import { ContextMenu, MenuItem } from 'react-contextmenu';
import { Arrow } from 'react-konva';

const DesignerContextMenu = (props: any) => {
  if (props.selectedObject !== null && props.isEvent(props.selectedObject)) {
    // Event context menu
    return (
      <ContextMenu id="contextmenu">
        <MenuItem onClick={() => props.createRelation("includesTo", props.selectedObject)}>
          Add Include
        </MenuItem>
        <MenuItem onClick={() => props.createRelation("excludesTo", props.selectedObject)}>
          Add Exclude
        </MenuItem>
        <MenuItem onClick={() => props.createRelation("responseTo", props.selectedObject)}>
          Add Response
        </MenuItem>
        <MenuItem onClick={() => props.createRelation("conditionsFor", props.selectedObject)}>
          Add Condition
        </MenuItem>
        <MenuItem onClick={() => props.createRelation("milestonesFor", props.selectedObject)}>
          Add Milestone
        </MenuItem>
        <MenuItem onClick={() => props.addToTrace(props.selectedObject)}>
          Add Test-Trace
        </MenuItem>
        <MenuItem onClick={() => props.addToContext(props.selectedObject)}>
          Add Test-Context
        </MenuItem>
        <MenuItem onClick={() => props.editEvent(props.selectedObject)}>
          Edit Event
        </MenuItem>
        <MenuItem onClick={() => props.removeEvent(props.selectedObject)}>
          Remove Event
        </MenuItem>
        <MenuItem onClick={() => props.removeFromTrace(props.selectedObject)}>
          Remove Test-Trace
        </MenuItem>
        <MenuItem onClick={() => props.removeFromContext(props.selectedObject)}>
          Remove Test-Context
        </MenuItem>
        <MenuItem onClick={() => props.changeMarking("Executed", props.selectedObject)}>
          Change Executed marking
        </MenuItem>
        <MenuItem onClick={() => props.changeMarking("Pending", props.selectedObject)}>
          Change Pending marking
        </MenuItem>
        <MenuItem onClick={() => props.changeMarking("Included", props.selectedObject)}>
          Change Included marking
        </MenuItem>
      </ContextMenu>
    );
  }
  else if (props.selectedObject !== null && props.selectedObject.target.className === Arrow) {
    // Relation context menu
    return (
      <ContextMenu id="contextmenu">
        <MenuItem onClick={() => props.removeRelation(props.selectedObject)}>
          Remove Relation
        </MenuItem>
      </ContextMenu>
    )
  }
  else {
    // Stage context menu
    return (
      <ContextMenu id="contextmenu">
        <MenuItem onClick={() => props.addEvent(props.selectedObject)}>
          Add Event
        </MenuItem>
      </ContextMenu>
    );
  }
}

export default DesignerContextMenu