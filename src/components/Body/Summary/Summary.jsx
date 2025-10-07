// src/components/Body/Summary/Summary.jsx
import SummaryContent from "./SummaryContent"; // ✅ relative path

const Summary = ({ month = "September", year = "2025" }) => {
  return (
    <>
      <section className="rounded-lg bg-white p-6 shadow w-full flex flex-col items-center mb-6">
        <h3 className="mb-2 text-2xl font-semibold text-slate-900 text-center">Summary</h3>
        <p className="text-center text-gray-600">
          Here are the Expenses Summary for {month} {year}
        </p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow w-full flex flex-col items-center">
        <SummaryContent />
      </section>
    </>
  );
};

export default Summary;
