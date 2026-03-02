import { useNavigate } from "react-router-dom"

const PageNotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Doctor avatar */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-blue-200 flex items-center justify-center text-6xl">
              👨‍⚕️
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xl shadow-sm">
              🩺
            </div>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-bold text-blue-600 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-8">
          Looks like this page went on a house call and never came back.
          <br />
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-lg">💊</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
        
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <span>↩️</span> Go Back
          </button>
        </div>

        
      </div>
    </div>
  )
}

export default PageNotFound 