import { Coords, UiEvent, UiRelation } from 'types';


export function calculateArrowUsingAngles(start_event: UiEvent, end_event: UiEvent, relation: UiRelation) {
  let start_endpoint_coords = calculateEndpointUsingAngles(start_event, relation.start_angle);
  let end_endpoint_coords = calculateEndpointUsingAngles(end_event, relation.end_angle);
  let x1 = start_endpoint_coords?.x;
  let y1 = start_endpoint_coords?.y;
  let x2 = end_endpoint_coords?.x;
  let y2 = end_endpoint_coords?.y;
  x1 = x1 !== (null || undefined) ? x1 : 0;
  y1 = y1 !== (null || undefined) ? y1 : 0;
  x2 = x2 !== (null || undefined) ? x2 : 0;
  y2 = y2 !== (null || undefined) ? y2 : 0;
  return [
    x1 !== (null || undefined) ? x1 : 0,
    y1 !== (null || undefined) ? y1 : 0,
    x2 !== (null || undefined) ? x2 : 0,
    y2 !== (null || undefined) ? y2 : 0];
}

export function getNewPosition(point1: UiEvent, point2: Coords) {
  let angle = calculateAngle(point1, point2);
  let points = calculateEndpointUsingAngles(point1, angle);
  let x1 = points?.x;
  let y1 = points?.y;
  x1 = x1 !== (null || undefined) ? x1 : 0;
  y1 = y1 !== (null || undefined) ? y1 : 0;
  return { x: x1, y: y1, angle: angle };
}
// X axis is horizontal; 0 is on the left; values grow as you go right
// Y axis is vertical; 0 is at the top; values grow as you go down
export function calculateEndpointUsingAngles(event: UiEvent, angle: number) {
  let p1 = {
    x: event.position.x + (event.size.width / 2),
    y: event.position.y + (event.size.height / 2),
  };
  let offset = event.size.height + event.size.width; // how far the other point is to make sure it's outside the rectangle
  let p2;
  p2 = {
    x: p1.x - (offset * Math.sin(angle * Math.PI / 180)),
    y: p1.y + (offset * Math.cos(angle * Math.PI / 180)),
  };

  let min_x = event.position.x - 5;
  let min_y = event.position.y - 5;
  let max_x = event.position.x + event.size.width + 10;
  let max_y = event.position.y + event.size.height + 10;
  let eq = getLineEquationFromPoints(p1, p2);
  if (p2.x < min_x) //If the second point of the segment is at left/bottom-left/top-left of the AABB
  {
    if (p2.y > min_y && p2.y < max_y) { return LSegsIntersectionPoint(p1, p2, { x: min_x, y: min_y }, { x: min_x, y: max_y }); } //If it is at the left
    else if (p2.y < min_y) //If it is at the top-left
    {
      // placing the intersection into the corner
      if (getYfromEquation(eq.a, eq.b, min_x) > min_y)
        // left
        return LSegsIntersectionPoint(p1, p2, { x: min_x, y: min_y }, { x: min_x, y: max_y });
      else
        // top
        return LSegsIntersectionPoint(p1, p2, { x: min_x, y: min_y }, { x: max_x, y: min_y });
    }
    else //if p2.y > max_y, i.e. if it is at the bottom-left
    {
      // placing the intersection into the corner
      if (getYfromEquation(eq.a, eq.b, min_x) > max_y)
        //bottom
        return LSegsIntersectionPoint(p1, p2, { x: min_x, y: max_y }, { x: max_x, y: max_y });
      else
        //left
        return LSegsIntersectionPoint(p1, p2, { x: min_x, y: min_y }, { x: min_x, y: max_y });
    }
  }

  else if (p2.x > max_x) //If the second point of the segment is at right/bottom-right/top-right of the AABB
  {
    if (p2.y > min_y && p2.y < max_y) {
      //If it is at the right
      return LSegsIntersectionPoint(p1, p2, { x: max_x, y: min_y }, { x: max_x, y: max_y });
    }
    else if (p2.y < min_y) //If it is at the top-right
    {
      if (getYfromEquation(eq.a, eq.b, max_x) > min_y)
        // right
        return LSegsIntersectionPoint(p1, p2, { x: max_x, y: min_y }, { x: max_x, y: max_y });
      else
        // top
        return LSegsIntersectionPoint(p1, p2, { x: min_x, y: min_y }, { x: max_x, y: min_y });
    }
    else //if p2.y > max_y, i.e. if it is at the bottom-right
    {
      if (getYfromEquation(eq.a, eq.b, max_x) > max_y)
        // bottom
        return LSegsIntersectionPoint(p1, p2, { x: min_x, y: max_y }, { x: max_x, y: max_y });
      else
        // right
        return LSegsIntersectionPoint(p1, p2, { x: max_x, y: min_y }, { x: max_x, y: max_y });
    }
  }

  else //If the second point of the segment is at top/bottom of the AABB
  {
    if (p2.y < min_y) return LSegsIntersectionPoint(p1, p2, { x: min_x, y: min_y }, { x: max_x, y: min_y }); //If it is at the top
    if (p2.y > max_y) return LSegsIntersectionPoint(p1, p2, { x: min_x, y: max_y }, { x: max_x, y: max_y }); //If it is at the bottom
  }
}

// calculates a and b in a line equation y = a*x + b based on 2 points
function getLineEquationFromPoints(pt1: any, pt2: any) {
  let a = (pt1.y - pt2.y) / (pt1.x - pt2.x);
  let b = pt1.y - a * pt1.x;
  return { a: a, b: b };
}

function getYfromEquation(a: number, b: number, x: number) {
  return a * x + b;
}


export function calculateInitialAngle(start_event: UiEvent, end_event: UiEvent) {

  let A = {
    x: start_event.position.x + (start_event.size.width / 2),
    y: start_event.position.y + (start_event.size.height / 2) + 50
  };
  let B = {
    x: start_event.position.x + (start_event.size.width / 2),
    y: start_event.position.y + (start_event.size.height / 2)
  }
  let C = {
    x: end_event.position.x + (end_event.size.width / 2),
    y: end_event.position.y + (end_event.size.height / 2)
  }

  let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  let start_degree = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180 / Math.PI;
  if (A.x < C.x) {
    start_degree = 180 + (180 - start_degree);
  }
  // degree at the end UiEvent
  C = {
    x: end_event.position.x + (end_event.size.width / 2),
    y: end_event.position.y + (end_event.size.height / 2) + 50
  };
  B = {
    x: end_event.position.x + (end_event.size.width / 2),
    y: end_event.position.y + (end_event.size.height / 2)
  }
  A = {
    x: start_event.position.x + (start_event.size.width / 2),
    y: start_event.position.y + (start_event.size.height / 2)
  }

  AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  let end_degree = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180 / Math.PI;
  if (C.x < A.x) {
    end_degree = 180 + (180 - end_degree);
  }
  return [start_degree, end_degree];
}

export function calculateAngle(start_event: UiEvent, end_event: Coords) {

  let A = {
    x: start_event.position.x + (start_event.size.width / 2),
    y: start_event.position.y + (start_event.size.height / 2) + 50
  };
  let B = {
    x: start_event.position.x + (start_event.size.width / 2),
    y: start_event.position.y + (start_event.size.height / 2)
  }
  let C = {
    x: end_event.x,
    y: end_event.y
  }
  let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  let start_degree = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180 / Math.PI;
  if (A.x < C.x) {
    start_degree = 180 + (180 - start_degree);
  }
  return start_degree;
}


function LSegsIntersectionPoint(ps1: any, pe1: any, ps2: any, pe2: any) {
  // Get A,B of first line - points : ps1 to pe1
  let A1 = pe1.y - ps1.y;
  let B1 = ps1.x - pe1.x;
  // Get A,B of second line - points : ps2 to pe2
  let A2 = pe2.y - ps2.y;
  let B2 = ps2.x - pe2.x;

  // Get delta and check if the lines are parallel
  let delta = A1 * B2 - A2 * B1;
  if (delta === 0)
    return null;

  // Get C of first and second lines
  let C2 = A2 * ps2.x + B2 * ps2.y;
  let C1 = A1 * ps1.x + B1 * ps1.y;
  //invert delta to make division cheaper
  let invdelta = 1 / delta;
  // now return the Vector2 intersection point
  return { x: (B2 * C1 - B1 * C2) * invdelta, y: (A1 * C2 - A2 * C1) * invdelta };
}
