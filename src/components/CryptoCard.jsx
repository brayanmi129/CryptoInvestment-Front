import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CryptoCard = ({ crypto }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("90d");
  const [historicalData, setHistoricalData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  useEffect(() => {
    if (!crypto) return;

    const fetchPrice = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/getDataById?id=${crypto.id}`
        );
        const data = res.data;

        const history = [
          { name: "90d", price: data.price_90d_ago, change: data.percent_change_90d },
          { name: "60d", price: data.price_60d_ago, change: data.percent_change_60d },
          { name: "30d", price: data.price_30d_ago, change: data.percent_change_30d },
          { name: "7d", price: data.price_7d_ago, change: data.percent_change_7d },
          { name: "24h", price: data.price_24h_ago, change: data.percent_change_24h },
          { name: "1h", price: data.price_1h_ago, change: data.percent_change_1h },
          { name: "Ahora", price: data.price, volume_24h: data.volume_24h },
        ];

        setPriceData(history);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
        setPriceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);

    return () => clearInterval(interval);
  }, [crypto]);

  const fetchHistoricalData = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/getCryptoHistory?id=${crypto.id}`
      );
      setHistoricalData(res.data);
    } catch (error) {
      console.error("Error obteniendo datos históricos:", error);
      setHistoricalData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const handleShowTable = () => {
    setShowTable(!showTable);
    if (!showTable && historicalData.length === 0) {
      fetchHistoricalData();
    }
  };

  const filterByRange = () => {
    if (!priceData) return [];
    const index = priceData.findIndex((d) => d.name === selectedRange);
    return selectedRange === "90d" ? priceData : priceData.slice(index);
  };

  const ranges = ["90d", "60d", "30d", "7d", "24h", "1h"];
  const isPositive = filterByRange()?.at(-1)?.price > filterByRange()?.[0]?.price;

  if (loading)
    return (
      <div className="flex justify-center items-center h-24 ">
        <p className="text-gray-400 ">Cargando datos...</p>
      </div>
    );

  return (
    <div className="w-full p-2 mx-auto mt-8">
      <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-xl p-6 md:p-8 flex flex-col gap-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white">{crypto.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 font-medium">Precio actual</p>
            <p className="text-xl font-bold text-green-500">
              {priceData?.at(-1)
                ? new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }).format(priceData.at(-1).price)
                : "No disponible"}
            </p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 font-medium">Variación en {selectedRange}</p>
            {(() => {
              const selected = priceData.find((item) => item.name === selectedRange);
              if (!selected || selected.change === undefined)
                return <span className="text-xl font-bold text-slate-500">No disp.</span>;
              const isPositiveChange = selected.change >= 0;
              const changeClass = isPositiveChange ? "text-green-500" : "text-red-500";
              return (
                <p className={`text-xl font-bold ${changeClass}`}>{selected.change.toFixed(2)} %</p>
              );
            })()}
          </div>
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 font-medium">Volumen (24h)</p>
            <p className="text-xl font-bold text-slate-300">
              {priceData?.at(-1)?.volume_24h
                ? new Intl.NumberFormat("es-CO", {
                    maximumFractionDigits: 0,
                  }).format(priceData.at(-1).volume_24h)
                : "No disponible"}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {priceData && (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={filterByRange()}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isPositive ? "#10b981" : "#ef4444"}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositive ? "#10b981" : "#ef4444"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8" }}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8" }}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(value) => [`$${value}`, "Precio"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-row md:flex-col gap-2 justify-center w-full md:w-1/6">
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`
                  py-2 text-sm font-semibold rounded-full transition-colors duration-200
                  ${
                    selectedRange === range
                      ? "bg-blue-600 text-white ring-2 ring-blue-500"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }
                `}
              >
                {range.replace("d", " días").replace("h", " h")}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={handleShowTable}
            className="py-2 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-200"
          >
            {showTable ? "Ocultar Historial" : "Mostrar Historial"}
          </button>
          {showTable && (
            <div className="overflow-x-auto bg-slate-800 rounded-xl p-4">
              {loadingTable ? (
                <p className="text-gray-400 text-center">Cargando historial...</p>
              ) : historicalData.length > 0 ? (
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Precio
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Cambio % (24h)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((data) => (
                      <tr
                        key={data.id}
                        className="border-b border-slate-700 hover:bg-slate-600 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                          }).format(data.price)}
                        </td>
                        <td className="px-6 py-4">{new Date(data.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{data.percent_change_24h.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-center">No hay datos históricos disponibles.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;
