export class Coordinates {
    y: number;
    x: number;
    osmid?: String;
    highway?: String;
}

export class MyNode {
    nodes: Coordinates[];
}

export class OriginDestPoints {
    longitude_original: Number;
    latitude_original: Number;
    longitude_destination: Number;
    latitude_destination: Number;
}
