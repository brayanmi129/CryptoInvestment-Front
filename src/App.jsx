// App.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import CryptoCard from "./components/CryptoCard";
import MiniCard from "./components/MiniCard";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

function App() {
  const [allCryptos, setAllCryptos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [randomCryptos, setRandomCryptos] = useState([]);

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getCryptoData`);
        setAllCryptos(res.data);
      } catch (error) {
        console.error("Error cargando lista de criptos", error);
      }
    };
    fetchCryptoList();
  }, []);

  useEffect(() => {
    if (allCryptos.length > 0) {
      const shuffled = [...allCryptos].sort(() => Math.random() - 0.5).slice(0, 10);
      setRandomCryptos(shuffled);
    }
  }, [allCryptos]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = allCryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [searchTerm, allCryptos]);

  const handleSelectCrypto = (crypto) => {
    console.log("Criptomoneda seleccionada:", crypto);
    setSelectedCrypto(crypto);

    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white py-4 ">
      <div className="w-full max-w-6xl mt-6 flex justify-between items-center ">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-400 text-center">
          Crypto Dashboard
        </h1>
        <div className="flex relative w-2/3">
          <div className="flex-grow relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar criptomoneda..."
              className="w-full p-3 rounded-l-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                &times;
              </button>
            )}

            {suggestions.length > 0 && (
              <ul className="absolute w-full top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-auto z-10 shadow-lg">
                {suggestions.map((crypto) => (
                  <li
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto)}
                    className="p-3 hover:bg-blue-600 cursor-pointer transition-colors"
                  >
                    {crypto.name} ({crypto.symbol})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            className="flex items-center justify-center w-12 bg-gray-800 border-t border-b border-r border-gray-600 rounded-r-lg hover:bg-blue-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {selectedCrypto ? (
        <div className="w-full max-w-7xl">
          <CryptoCard crypto={selectedCrypto} />
        </div>
      ) : (
        <div className="mt-6 w-full max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
            {randomCryptos.map((crypto) => (
              <MiniCard key={crypto.id} crypto={crypto} onSelect={handleSelectCrypto} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
