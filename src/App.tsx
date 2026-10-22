import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router/index.tsx'

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
