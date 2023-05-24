import React from 'react';
import { Rect, Transformer, Text, Group } from 'react-konva';

export const EventUI = ({ eventProps, isSelected, onSelect, onChange,
  onDragMove, onDragStart, onDragEnd, onTransformEndDes }: any) => {
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Group
        onClick={onSelect}
        ref={shapeRef}
        id={eventProps.id}
        x={eventProps.position.x}
        y={eventProps.position.y}
        width={eventProps.size.width}
        height={eventProps.size.height}
        draggable
        onDragMove={onDragMove}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT it's width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...eventProps,
            position: {
              x: node.x(),
              y: node.y()
            },
            // set minimal value
            size: {
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY)
            }
          });
          onTransformEndDes(e, { x: node.x(), y: node.y(), width: node.width() * scaleX, height: node.height() * scaleY });
        }}>
        <Rect
          width={eventProps.size.width}
          height={eventProps.size.height}
          fill="white"
          stroke={eventProps.is_excluded ? "red" : "blue"}
          dashEnabled={eventProps.is_excluded ? true : false}
          dash={[10, 5]}
          zIndex={2}
        />
        <Text
          text={eventProps.name}
          width={eventProps.size.width}
          verticalAlign="middle"
          align="center"
          fontSize={20}
          zIndex={1}
        />
        <Text
          text={eventProps.description}
          width={eventProps.size.width}
          y={eventProps.size.height / 2}
          verticalAlign="middle"
          align="center"
          zIndex={1}
        />
        <Text
          fontSize={7}
          text={"Executed: \n\n" + eventProps.is_executed}
          width={eventProps.size.width / 2}
          verticalAlign="top"
          zIndex={1}
          y={eventProps.size.height - (eventProps.size.height / 5)}
          x={((eventProps.size.width / 3) - eventProps.size.width / 5)} />
        <Text
          fontSize={7}
          text={"Pending: \n\n" + eventProps.is_pending}
          width={eventProps.size.width / 3}
          verticalAlign="top"
          zIndex={1}
          y={eventProps.size.height - (eventProps.size.height / 5)}
          x={(eventProps.size.width / 2)} />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          children
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};