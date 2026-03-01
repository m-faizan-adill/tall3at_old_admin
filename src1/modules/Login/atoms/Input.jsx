export default function Input({
  type = 'text',
  name = '',
  value = '',
  onChange = () => {},
  placeholder = '',
  icon = '',
  required = false,
  className = '',
}) {

    const inputClassName = `w-full px-4 py-3 pr-12
            border-2 border-cyan-500
            rounded-xl text-base font-medium
            bg-white text-cyan-500
            focus:outline-none focus:ring-4 focus:ring-blue-900 focus:ring-opacity-10
            placeholder:text-cyan-500 placeholder:font-normal placeholder:text-right
            transition-all duration-300`;

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        {/* Icon */}
        {icon && (
          <i
            className={`absolute right-3 text-gray-400 text-lg pointer-events-none z-10 ${icon}`}
          ></i>
        )}
        
        {/* Input Field */}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          dir="rtl"
          className={`
            ${inputClassName}
            ${className}
          `}
        />
      </div>
    </div>
  );
}