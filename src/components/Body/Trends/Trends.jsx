import TrendsGraph from './TrendsGraph';

const Trends = () => {
  return (
    <section className="rounded-lg bg-white p-6 shadow w-full flex flex-col items-center">
      <h3 className="mb-2 text-2xl font-semibold text-slate-900 text-center">Trends</h3>
      <p className="text-slate-700 text-center mb-4">Track your expenses over time and see financial trends.</p>
      <TrendsGraph />
    </section>
  );
};

export default Trends;
