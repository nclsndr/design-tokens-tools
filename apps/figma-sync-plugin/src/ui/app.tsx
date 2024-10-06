import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="homepage">
      <h4>Design Tokens Sync</h4>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
