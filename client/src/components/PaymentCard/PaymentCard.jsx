function PaymentCard({ method, icon, name, description, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(method)}
      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
        selected ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
      }`}>
        {selected && <div className="w-3 h-3 bg-primary-500 rounded-full" />}
      </div>
    </div>
  );
}

export default PaymentCard;
