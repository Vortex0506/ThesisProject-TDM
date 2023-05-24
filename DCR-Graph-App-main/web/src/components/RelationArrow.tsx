import React from 'react';
import { Group, Shape, Arrow, Circle } from 'react-konva';

export const RelationArrow = ({ relationProps, isRelationSelected, onSelect, onRelationDragEnd }: any) => {


  React.useEffect(() => {

    if (isRelationSelected) {

    }
  }, [isRelationSelected]);

  const eventRelativePositioning = () => {
    if (relationProps.end_angle < 45 || relationProps.end_angle >= 315) {
      return "bottomToTop";
    }
    else if (relationProps.end_angle >= 45 && relationProps.end_angle < 135) {
      return "leftToRight";
    }
    else if (relationProps.end_angle >= 135 && relationProps.end_angle < 225) {
      return "topToBottom";
    }
    else { //relationProps.end_angle >= 225 || relationProps.end_angle < 315
      return "rightToLeft";
    }

  }

  const getArrowPositions = () : number[] => {
    let end_offset = relationProps.type === "responseTo" ? 2 : 12;

    if (relationProps.start_event_id === relationProps.end_event_id) {
      // this is a self-relation
      return [relationProps.start_position.x + 10, relationProps.start_position.y,
      relationProps.start_position.x + 5, relationProps.start_position.y - 30,
      relationProps.end_position.x + end_offset, relationProps.end_position.y]
    } else {
      switch (eventRelativePositioning()) {
        case "bottomToTop":
          return [relationProps.start_position.x, relationProps.start_position.y, relationProps.end_position.x, relationProps.end_position.y + end_offset];
        case "leftToRight":
          return [relationProps.start_position.x, relationProps.start_position.y, relationProps.end_position.x - end_offset, relationProps.end_position.y];
        case "topToBottom":
          return [relationProps.start_position.x, relationProps.start_position.y, relationProps.end_position.x, relationProps.end_position.y - end_offset];
        case "rightToLeft":
          return [relationProps.start_position.x, relationProps.start_position.y, relationProps.end_position.x + end_offset, relationProps.end_position.y];
      }
    }
  }

  const getArrowColor = () => {
    // using the colors from the example image
    switch (relationProps.type) {
      case "conditionsFor":
        return "#ffa701";
      case "milestonesFor":
        return "#bd18f3";
      case "responseTo":
        return "#1c8fff";
      case "includesTo":
        return "#2baa1c";
      case "excludesTo":
        return "#ff0203";
      // just to make sure no errors
      default:
        return "#374b64"; // spawn arrow color
    }
  }

  const drawArrow = () => {
    return (
      <React.Fragment>
        <Arrow
          onClick={onSelect}
          key={relationProps.id}
          id={relationProps.id}
          points={getArrowPositions()}
          fill={getArrowColor()}
          stroke={getArrowColor()}
        />

        {isRelationSelected && (
          <React.Fragment>
            <Circle
              radius={5}
              id={relationProps.id + ".start"}
              position={"start"}
              x={relationProps.start_position.x}
              y={relationProps.start_position.y}
              stroke={"black"}
              strokeWidth={4}
              fill={"black"}
              draggable
              onDragEnd={onRelationDragEnd}
            />
            <Circle
              radius={5}
              id={relationProps.id + ".end"}
              x={relationProps.end_position.x}
              y={relationProps.end_position.y}
              stroke={"black"}
              strokeWidth={4}
              fill={"black"}
              draggable
              onDragEnd={onRelationDragEnd}
            />
          </React.Fragment>
        )
        }
      </React.Fragment>
    );
  }

  const drawShapeCircle = (context: any, isAtEnd: boolean) => {
    switch (eventRelativePositioning()) {
      case "bottomToTop":
        isAtEnd ?
          context.arc(relationProps.end_position.x, relationProps.end_position.y + 6, 4, 0, 2 * Math.PI, true) :
          context.arc(relationProps.start_position.x, relationProps.start_position.y - 6, 4, 0, 2 * Math.PI, true);
        break;
      case "leftToRight":
        isAtEnd ?
          context.arc(relationProps.end_position.x - 6, relationProps.end_position.y, 4, 0, 2 * Math.PI, true) :
          context.arc(relationProps.start_position.x + 6, relationProps.start_position.y, 4, 0, 2 * Math.PI, true);
        break;
      case "topToBottom":
        isAtEnd ?
          context.arc(relationProps.end_position.x, relationProps.end_position.y - 6, 4, 0, 2 * Math.PI, true) :
          context.arc(relationProps.start_position.x, relationProps.start_position.y + 6, 4, 0, 2 * Math.PI, true);
        break;
      case "rightToLeft":
        isAtEnd ?
          context.arc(relationProps.end_position.x + 6, relationProps.end_position.y, 4, 0, 2 * Math.PI, true) :
          context.arc(relationProps.start_position.x - 6, relationProps.start_position.y, 4, 0, 2 * Math.PI, true);
        break;
    }
  }

  const drawShapeCross = (context: any) => {
    switch (eventRelativePositioning()) {
      case "bottomToTop":
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y + 12);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y + 7);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y + 7);
        break;
      case "leftToRight":
        context.moveTo(relationProps.end_position.x - 12, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x - 7, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x - 7, relationProps.end_position.y - 6);
        break;
      case "topToBottom":
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y - 12);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y - 7);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y - 7);
        break;
      case "rightToLeft":
        context.moveTo(relationProps.end_position.x + 12, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x + 7, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x + 7, relationProps.end_position.y - 6);
        break;
    }
  }

  const drawShapeDiamond = (context: any) => {
    switch (eventRelativePositioning()) {
      case "bottomToTop":
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y + 12);
        context.lineTo(relationProps.end_position.x + 6, relationProps.end_position.y + 6);
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y + 6);
        context.moveTo(relationProps.end_position.x - 6, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y + 12);
        break;
      case "leftToRight":
        context.moveTo(relationProps.end_position.x - 12, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y + 6);
        context.moveTo(relationProps.end_position.x - 6, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y - 6);
        context.moveTo(relationProps.end_position.x - 6, relationProps.end_position.y - 6);
        context.lineTo(relationProps.end_position.x - 12, relationProps.end_position.y);
        break;
      case "topToBottom":
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y - 12);
        context.lineTo(relationProps.end_position.x + 6, relationProps.end_position.y - 6);
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y - 6);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y - 6);
        context.moveTo(relationProps.end_position.x - 6, relationProps.end_position.y - 6);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y - 12);
        break;
      case "rightToLeft":
        context.moveTo(relationProps.end_position.x + 12, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x + 6, relationProps.end_position.y + 6);
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x, relationProps.end_position.y);
        context.moveTo(relationProps.end_position.x, relationProps.end_position.y);
        context.lineTo(relationProps.end_position.x + 6, relationProps.end_position.y - 6);
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y - 6);
        context.lineTo(relationProps.end_position.x + 12, relationProps.end_position.y);
        break;
    }
  }

  const drawShapePercentage = (context: any) => {
    switch (eventRelativePositioning()) {
      case "bottomToTop":
        context.moveTo(relationProps.end_position.x + 5, relationProps.end_position.y + 2);
        context.lineTo(relationProps.end_position.x - 5, relationProps.end_position.y + 12);
        context.moveTo(relationProps.end_position.x - 3, relationProps.end_position.y + 3);
        context.arc(relationProps.end_position.x - 3, relationProps.end_position.y + 3, 2, 0, 2 * Math.PI, true);
        context.moveTo(relationProps.end_position.x + 4, relationProps.end_position.y + 10);
        context.arc(relationProps.end_position.x + 4, relationProps.end_position.y + 10, 2, 0, 2 * Math.PI, true);
        break;
      case "leftToRight":
        context.moveTo(relationProps.end_position.x - 2, relationProps.end_position.y - 6);
        context.lineTo(relationProps.end_position.x - 12, relationProps.end_position.y + 6);
        context.moveTo(relationProps.end_position.x - 3, relationProps.end_position.y + 3);
        context.arc(relationProps.end_position.x - 3, relationProps.end_position.y + 3, 2, 0, 2 * Math.PI, true);
        context.moveTo(relationProps.end_position.x - 10, relationProps.end_position.y - 4);
        context.arc(relationProps.end_position.x - 10, relationProps.end_position.y - 4, 2, 0, 2 * Math.PI, true);
        break;
      case "topToBottom":
        context.moveTo(relationProps.end_position.x + 6, relationProps.end_position.y - 12);
        context.lineTo(relationProps.end_position.x - 6, relationProps.end_position.y - 2);
        context.moveTo(relationProps.end_position.x - 3, relationProps.end_position.y - 10);
        context.arc(relationProps.end_position.x - 3, relationProps.end_position.y - 10, 2, 0, 2 * Math.PI, true);
        context.moveTo(relationProps.end_position.x + 4, relationProps.end_position.y - 4);
        context.arc(relationProps.end_position.x + 4, relationProps.end_position.y - 4, 2, 0, 2 * Math.PI, true);
        break;
      case "rightToLeft":
        context.moveTo(relationProps.end_position.x + 2, relationProps.end_position.y + 6);
        context.lineTo(relationProps.end_position.x + 12, relationProps.end_position.y - 6);
        context.moveTo(relationProps.end_position.x + 3, relationProps.end_position.y - 3);
        context.arc(relationProps.end_position.x + 3, relationProps.end_position.y - 3, 2, 0, 2 * Math.PI, true);
        context.moveTo(relationProps.end_position.x + 10, relationProps.end_position.y + 4);
        context.arc(relationProps.end_position.x + 10, relationProps.end_position.y + 4, 2, 0, 2 * Math.PI, true);
        break;
    }
  }

  return (
    <React.Fragment>
      <Group>
        {/* Draw Arrow */}
        {drawArrow()}

        {/* Draw Additional Shape */}
        <Shape
          sceneFunc={(context, shape) => {
            shape.strokeWidth(1.5)

            context.beginPath();
            switch (relationProps.type) {
              case "conditionsFor":
                drawShapeCircle(context, true);
                break;
              case "milestonesFor":
                drawShapeDiamond(context);
                break;
              case "responseTo":
                drawShapeCircle(context, false);
                break;
              case "includesTo":
                drawShapeCross(context);
                break;
              case "excludesTo":
                drawShapePercentage(context);
                break;
            }
            context.closePath();

            // (!) Konva specific method, it is very important
            context.fillStrokeShape(shape);
          }}
          fill={getArrowColor()}
          stroke={getArrowColor()}
        />

      </Group>
    </React.Fragment>
  );
}