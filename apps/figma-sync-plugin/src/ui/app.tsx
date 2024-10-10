import { useState } from 'react';
import { usePostMessages } from '@ui/hooks/usePostMessages';

function App() {
  const [seedStatus, setSeedStatus] = useState('not synced');
  const [variables, setVariables] = useState<Array<string>>([]);
  const { getVariablesAndCollections, seedTestingData } = usePostMessages();

  return (
    <div className="homepage">
      <h4>Design Tokens Sync</h4>

      <div className="card">
        <button
          onClick={() =>
            getVariablesAndCollections(null, ([st, err]) => {
              if (err) {
                console.error(err);
                return;
              }
              if (st) {
                setVariables(st.variables);
              }
            })
          }
        >
          get stuff
        </button>
        <button
          onClick={() =>
            seedTestingData(null, ([st, err]) => {
              if (err) {
                console.error(err);
                return;
              }
              if (st === null) {
                setSeedStatus('synced');
              }
            })
          }
        >
          seed stuff
        </button>
      </div>

      <p>{seedStatus}</p>
      <ul>
        {variables.map((variable) => (
          <li key={variable}>{variable}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
