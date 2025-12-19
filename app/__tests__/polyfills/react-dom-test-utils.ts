/**
 * Polyfill for react-dom/test-utils to work with React 19
 *
 * React 19 moved `act` from react-dom/test-utils to react package.
 * @testing-library/react still tries to import from react-dom/test-utils,
 * so we provide this polyfill that redirects to react's act.
 *
 * This polyfill intercepts all imports from 'react-dom/test-utils' and
 * provides the act function from 'react' instead.
 */

import { act } from "react";

// Export act as named export (matches react-dom/test-utils API)
export { act };

// Export as default object with act property (for compatibility)
const TestUtils = {
  act,
};

export default TestUtils;
