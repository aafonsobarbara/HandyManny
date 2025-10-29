import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import useQuoteStore from './store/quoteStore';
import { fetchQuotes } from './services/quotes';

function App() {
  const { setQuotes, setActiveQuote, createDraft } = useQuoteStore();

  useEffect(() => {
    fetchQuotes()
      .then((data) => {
        setQuotes(data);
        if (data.length > 0) {
          setActiveQuote(data[0]);
        } else {
          createDraft();
        }
      })
      .catch((error) => {
        console.error('Failed to load quotes', error);
        createDraft();
      });
  }, [setQuotes, setActiveQuote, createDraft]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Dashboard />
    </div>
  );
}

export default App;
