import CsvUploader from './components/panel';
import Header from '../GLY_SALES_AGENTS/components/header'
import ModalIicio from './components/madalInicio'
export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <Header />
      <ModalIicio />
      <CsvUploader />
    </main>
  );
}
