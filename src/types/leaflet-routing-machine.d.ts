declare module 'leaflet-routing-machine' {
  import * as L from 'leaflet';
  namespace L {
    namespace Routing {
      function control(options: any): any;
      function osrmv1(options?: any): any;
      class Line extends L.Polyline {}
    }
  }
  export {};
}
