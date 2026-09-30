// utils/hubConfig.js
// Where each Command Hub action leads. Everything here points at a page that
// exists in this app today.
//
// poseDetection: this repo has no camera / pose-detection module. The
// "Analyze my squat form" chip only renders once a route is set here, so the
// hub never shows a button that goes nowhere. Example: "/form-check".
export const HUB_ROUTES = {
  workout: "/plans",
  progress: "/progress",
  nutrition: "/plans",
  poseDetection: null,
};
