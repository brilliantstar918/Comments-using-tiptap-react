import React from 'react';
import { ThreadEditor } from './components/ThreadEditor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ThreadEditor />
    </div>
  );
};

export default App;