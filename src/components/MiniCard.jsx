const ChangeIcon = ({ isPositive }) => {
  const rotation = isPositive ? "rotate-180" : "";
  const color = isPositive ? "text-green-400" : "text-red-400";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 mr-1 transition-transform ${rotation} ${color}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
};

function MiniCard({ crypto, onSelect }) {
  const isPositive = crypto.percent_change_24h >= 0;
  const formattedPrice = Number(crypto.price) ? `$${Number(crypto.price).toFixed(2)}` : "--";
  const formattedChange = `${Number(crypto.percent_change_24h).toFixed(2)}%`;

  return (
    <button
      onClick={() => onSelect(crypto)}
      className="group flex flex-col justify-between cursor-pointer bg-gray-800 p-5 rounded-2xl shadow-lg w-full max-w-sm m-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/50"
    >
      <div className="flex items-center mb-4">
        <img
          src={crypto.logo}
          alt={crypto.name}
          className="w-14 h-14 mr-4 rounded-full border-2 border-gray-700 object-cover"
        />
        <div>
          <h2 className="text-xl font-extrabold text-white ">{crypto.name}</h2>
          <p className="text-sm text-gray-400 uppercase tracking-wider">{crypto.symbol}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-white mb-1">{formattedPrice}</p>
        <div className="flex items-center justify-end">
          <ChangeIcon isPositive={isPositive} />
          <span
            className={`text-sm font-semibold transition-colors ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {formattedChange}
          </span>
        </div>
      </div>
    </button>
  );
}

export default MiniCard;
