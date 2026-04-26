import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CarFront, Footprints, ArrowUpToLine, ShieldAlert, Globe, X, Loader2 } from 'lucide-react';
import { fetchSidesForCountry, CountrySides } from './services/gemini';

interface Country {
  name: {
    common: string;
  };
  cca3: string;
  flag: string;
}

export default function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
  const [loadingSides, setLoadingSides] = useState(false);
  const [countrySides, setCountrySides] = useState<CountrySides | null>(null);
  const [errorSides, setErrorSides] = useState('');

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca3,flag')
      .then(r => r.json())
      .then((data: Country[]) => {
        // Sort alphabetically
        const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      })
      .catch(e => console.error('Failed to fetch countries', e));
  }, []);

  const handleSelectCountry = async (country: Country) => {
    setSelectedCountry(country);
    setCountrySides(null);
    setErrorSides('');
    setLoadingSides(true);

    try {
      const sides = await fetchSidesForCountry(country.name.common);
      setCountrySides(sides);
    } catch (err) {
      setErrorSides('Failed to load rules for this country. Please try again.');
    } finally {
      setLoadingSides(false);
    }
  };

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    return countries.filter(c => c.name.common.toLowerCase().includes(search.toLowerCase()));
  }, [search, countries]);

  return (
    <div className="min-h-screen bg-lime-300 text-black font-sans selection:bg-fuchsia-500 selection:text-white bg-polka flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 h-24 border-b-8 border-black bg-indigo-500 flex items-center justify-between px-4 sm:px-10 flex-shrink-0 brutal-shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 border-4 border-black brutal-shadow-sm flex items-center justify-center text-black rotate-12 hover:rotate-45 transition-transform">
            <Globe className="w-8 h-8" />
          </div>
          <span className="text-3xl sm:text-4xl font-black tracking-tighter text-white drop-shadow-[4px_4px_0_#000] uppercase italic">WhichSide!</span>
        </div>

        <div className="flex-1 max-w-md mx-4 sm:mx-10">
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 w-6 h-6 text-black z-10" />
            <input 
              type="text" 
              placeholder="SEARCH COUNTRY..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-4 border-black py-3 pl-12 pr-4 text-lg font-bold focus:outline-none focus:bg-cyan-100 placeholder-gray-500 text-black brutal-shadow-sm translate-y-[-4px] transition-all focus:translate-y-0 focus:brutal-shadow-none uppercase"
            />
          </div>
        </div>

        <div className="hidden lg:block text-lg font-black text-black uppercase drop-shadow-[2px_2px_0_#fff] rotate-[-2deg]">
          Global Protocol Guide
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-10 py-12 pb-32">
        {countries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-black">
            <Loader2 className="w-16 h-16 animate-spin mb-4 text-fuchsia-600 drop-shadow-[4px_4px_0_#000]" />
            <p className="font-black text-3xl uppercase bg-yellow-400 border-4 border-black px-6 py-2 rotate-2 brutal-shadow-sm">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {filteredCountries.map((country, index) => (
              <button
                key={country.cca3}
                onClick={() => handleSelectCountry(country)}
                className={`flex flex-col items-center justify-center p-6 bg-white border-4 border-black brutal-shadow transition-all text-center group ${index % 3 === 0 ? '-rotate-2' : index % 2 === 0 ? 'rotate-1' : 'rotate-3'} hover:bg-yellow-300 hover:translate-x-1 hover:translate-y-1 hover:brutal-shadow-none`}
              >
                <span className="text-6xl mb-4 group-hover:rotate-12 group-hover:scale-125 transition-transform drop-shadow-[4px_4px_0_#000]">{country.flag}</span>
                <span className="text-lg font-black text-black leading-tight line-clamp-2 uppercase">{country.name.common}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <span className="bg-red-500 text-white text-4xl font-black uppercase border-4 border-black px-8 py-4 rotate-3 inline-block brutal-shadow-sm">
                  NOTHING FOUND for "{search}" !!!
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-fuchsia-600/90 backdrop-blur-md"
            onClick={() => setSelectedCountry(null)}
          >
            <motion.div 
              initial={{ opacity: 0, y: 100, rotate: -5, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, rotate: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-full max-w-5xl bg-white border-8 border-black brutal-shadow-lg relative max-h-[95vh] flex flex-col sm:rotate-2"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCountry(null)}
                className="absolute -top-4 -right-4 sm:top-6 sm:right-6 p-4 bg-red-500 hover:bg-red-400 border-4 border-black brutal-shadow transition-all hover:translate-y-1 hover:brutal-shadow-none text-white z-20 rounded-full"
              >
                <X className="w-6 h-6 stroke-[4]" />
              </button>

              <div className="p-6 sm:p-12 overflow-y-auto bg-polka relative">
                {/* Crazy Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-12 bg-cyan-400 p-8 border-4 border-black brutal-shadow -rotate-2 sm:-rotate-1 sm:mr-16 mt-4 relative z-10">
                  <span className="text-8xl sm:text-9xl leading-none animate-bounce drop-shadow-[8px_8px_0_#000]">{selectedCountry.flag}</span>
                  <div className="text-center sm:text-left">
                    <h2 className="text-5xl sm:text-7xl font-black text-black tracking-tighter uppercase leading-tight drop-shadow-[4px_4px_0_#fff]">
                      {selectedCountry.name.common}
                    </h2>
                    <div className="inline-block mt-4 -rotate-3">
                      <p className="text-lime-300 text-xl sm:text-3xl bg-black px-6 py-2 font-black border-4 border-black shadow-[4px_4px_0_#f0f]">
                        THE RULES!!!
                      </p>
                    </div>
                  </div>
                </div>

                {loadingSides && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border-4 border-black brutal-shadow max-w-md mx-auto rotate-2">
                    <Loader2 className="w-16 h-16 animate-spin text-fuchsia-600 mb-6 drop-shadow-[4px_4px_0_#000]" />
                    <p className="text-black text-2xl font-black uppercase tracking-widest">Searching...</p>
                  </div>
                )}
                
                {errorSides && (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white border-4 border-black brutal-shadow p-8 max-w-xl mx-auto -rotate-1">
                    <div className="w-20 h-20 bg-red-500 flex items-center justify-center mb-6 text-white border-4 border-black brutal-shadow-sm rotate-12">
                      <ShieldAlert className="w-10 h-10" />
                    </div>
                    <p className="text-black font-black text-2xl mb-8 uppercase line-clamp-3">{errorSides}</p>
                    <button 
                      onClick={() => handleSelectCountry(selectedCountry)}
                      className="px-8 py-4 bg-yellow-400 border-4 border-black brutal-shadow-sm hover:translate-y-1 hover:brutal-shadow-none text-black font-black text-xl transition-all uppercase"
                    >
                      TRY AGAIN!
                    </button>
                  </div>
                )}

                {countrySides && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
                    className="flex flex-col h-full z-10 relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                      {/* Driving */}
                      <div className="bg-yellow-400 border-4 border-black brutal-shadow p-6 sm:p-8 flex flex-col hover:-translate-y-2 hover:-rotate-3 transition-transform">
                        <div className="w-16 h-16 bg-white border-4 border-black brutal-shadow-sm flex items-center justify-center mb-8 -rotate-6">
                          <CarFront className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-2 bg-white inline-block w-max px-2 py-1 border-2 border-black rotate-2">DRIVING</h3>
                        <p className="text-4xl sm:text-5xl font-black text-black drop-shadow-[2px_2px_0_#fff] mt-2">{countrySides.driving}</p>
                      </div>

                      {/* Walking */}
                      <div className="bg-pink-400 border-4 border-black brutal-shadow p-6 sm:p-8 flex flex-col hover:-translate-y-2 hover:rotate-3 transition-transform mt-0 md:mt-8">
                        <div className="w-16 h-16 bg-white border-4 border-black brutal-shadow-sm flex items-center justify-center mb-8 rotate-6">
                          <Footprints className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-2 bg-white inline-block w-max px-2 py-1 border-2 border-black -rotate-2">WALKING</h3>
                        <p className="text-4xl sm:text-5xl font-black text-black drop-shadow-[2px_2px_0_#fff] mt-2">{countrySides.walking}</p>
                      </div>

                      {/* Escalator */}
                      <div className="bg-lime-400 border-4 border-black brutal-shadow p-6 sm:p-8 flex flex-col hover:-translate-y-2 hover:-rotate-1 transition-transform mt-0 md:-mt-4">
                        <div className="w-16 h-16 bg-white border-4 border-black brutal-shadow-sm flex items-center justify-center mb-8 -rotate-12">
                          <ArrowUpToLine className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-2 bg-white inline-block w-max px-2 py-1 border-2 border-black rotate-1">ESCALATOR</h3>
                        <p className="text-4xl sm:text-5xl font-black text-black drop-shadow-[2px_2px_0_#fff] mt-2">{countrySides.escalator}</p>
                      </div>
                    </div>

                    <div className="mt-12 p-8 bg-indigo-500 text-white border-4 border-black brutal-shadow text-center rotate-1 hover:rotate-0 transition-transform">
                      <p className="text-2xl sm:text-3xl font-black uppercase leading-tight drop-shadow-[2px_2px_0_#000]">
                        "{countrySides.funFact}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
