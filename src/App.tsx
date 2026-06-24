/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <div id="app-root">
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    </div>
  );
}
