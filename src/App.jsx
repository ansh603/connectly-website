// src/App.jsx
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AppProvider } from './context/AppContext.jsx'
import AppRoutes from './routes/index.jsx'

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
      <ToastContainer position="top-right" newestOnTop closeOnClick pauseOnHover />
    </AppProvider>
  )
}
