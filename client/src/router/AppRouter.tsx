import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import EmailDetailPage from "../pages/EmailDetailPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/email/:id" element={<EmailDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
