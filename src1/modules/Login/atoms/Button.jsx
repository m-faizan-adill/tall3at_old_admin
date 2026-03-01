export default function Button({ loading = false }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`
        w-full px-4 py-4 rounded-xl font-semibold text-base text-white
        bg-cyan-500 hover:bg-cyan-600 transition-all duration-300
        flex items-center justify-center gap-2
        shadow-lg hover:shadow-xl hover:translate-y-[-2px]
        active:translate-y-0
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        ${loading ? 'pointer-events-none' : ''}
        relative overflow-hidden group mt-3
      `}
    >
      {/* Hover background slide effect */}
      <div className="absolute inset-0 bg-cyan-500 translate-x-full group-hover:translate-x-0 transition-transform duration-500 -z-10"></div>
      
      {loading ? (
        <>
          <i className="fas fa-spinner animate-spin-custom"></i>
          <span>جاري تسجيل الدخول...</span>
        </>
      ) : (
        <>
          <span>تسجيل الدخول</span>
          <i className="fas fa-sign-in-alt group-hover:-translate-x-1 transition-transform duration-300"></i>
        </>
      )}
    </button>
  );
}