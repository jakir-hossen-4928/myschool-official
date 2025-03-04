const Stats = () => {
  return (
    <div className="bg-gradient-to-r from-sky-400 via-green-400 to-yellow-400 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              শত শত পরিবারের আস্থা অর্জন করেছে
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/90">
              আমাদের উৎকর্ষতার প্রতিশ্রুতি আমাদের পরিসংখ্যানে প্রতিফলিত হয়
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: 1, name: "অতীতে অর্জিত সফলতা", value: "১+ বছর" },
              { id: 2, name: "শিক্ষার্থী সংখ্যা", value: "১০০+" },
              { id: 3, name: "প্রশিক্ষিত শিক্ষক", value: "১০+" },
              { id: 4, name: "সাফল্যের হার", value: "৯৫%" },
            ].map((stat) => (
              <div key={stat.id} className="flex flex-col bg-white/10 backdrop-blur-sm p-8">
                <dt className="text-sm font-semibold leading-6 text-white">
                  {stat.name}
                </dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Stats;