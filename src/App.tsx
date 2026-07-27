/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreFront } from './pages/StoreFront';
import { AdminPanel } from './pages/AdminPanel';
import { StatisticsPanel } from './pages/StatisticsPanel';
import { Login } from './pages/Login';
import { PostDetails } from './pages/PostDetails';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/statistics" element={<StatisticsPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/hakkinda" element={<About />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/hizmet-sartlari" element={<TermsOfService />} />
        <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}
