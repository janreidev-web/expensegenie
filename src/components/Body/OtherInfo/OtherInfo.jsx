import OtherInfoContent from './OtherInfoContent';

const OtherInfo = () => {
  return (
    <section className="rounded-lg bg-white p-6 shadow w-full flex flex-col items-center">
      <h3 className="mb-2 text-2xl font-semibold text-slate-900 text-center">Other Information</h3>
      <p className="text-slate-700 text-center mb-4">Explore additional tools and resources.</p>
      <OtherInfoContent />
    </section>
  );
};

export default OtherInfo;
