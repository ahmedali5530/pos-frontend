import ReactGA from "react-ga4";

ReactGA.initialize([{
  trackingId: import.meta.env.VITE_GOOGLE_ANALYTICS
}]);


export default ReactGA;
