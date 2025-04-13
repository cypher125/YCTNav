// Type definitions for leaflet-editable
// Project: https://github.com/Leaflet/Leaflet.Editable
// Definitions by: YabaTech Campus Map

import * as L from 'leaflet';

declare module 'leaflet' {
  interface Map {
    editTools?: Editable;
  }

  interface Polygon {
    enableEdit?(): void;
    disableEdit?(): void;
    editor?: PolygonEditor;
  }

  interface PolygonEditor {
    drawing(): void;
    disable(): void;
  }

  class Editable {
    constructor(map: L.Map);
    startPolygon(): L.Polygon;
    edit(layer: L.Layer): L.Layer;
  }
}

declare module 'leaflet-editable' {
  import * as L from 'leaflet';
  export = L.Editable;
} 