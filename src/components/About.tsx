const About = () => {
  return (
    <div id="about" className="py-24 sm:py-32 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            আমাদের সম্পর্কে
          </h2>
          <p className="mt-6 text-lg leading-8 text-white">
            MySchool-মাইস্কুল-এ, আমরা বিশ্বাস করি যে, তরুণ মনগুলি দায়িত্বশীল, উদ্ভাবনী এবং সহানুভূতিশীল ব্যক্তিত্বে পরিণত হতে সাহায্য করতে হবে। আমাদের লক্ষ্য হল এমন একটি পূর্ণাঙ্গ শিক্ষা প্রদান করা যা শিক্ষার্থীদের আগামী দিনের চ্যালেঞ্জগুলির জন্য প্রস্তুত করবে।
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-white/10 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none bg-gradient-to-r from-purple-500 via-blue-500 to-sky-500">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <img
                src="/chairman.jpg"
                alt="Chairman"
                className="w-48 h-48 rounded-full object-cover border-4 border-white"
              />
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  চেয়ারম্যানের বার্তা
                </h3>
                <p className="mt-6 text-base leading-7 text-white">
                  "শিক্ষা শুধু একাডেমিক উৎকর্ষতা সম্পর্কে নয়; এটি চরিত্র গঠন, সৃজনশীলতা উত্সাহিত করা, এবং এমন মূল্যবোধ প্রতিষ্ঠা করার বিষয় যা আমাদের শিক্ষার্থীদের সারা জীবনের পথে নির্দেশনা দেবে। MySchool-মাইস্কুল-এ, আমরা একটি পরিবেশ তৈরি করতে প্রতিশ্রুতিবদ্ধ যেখানে প্রতিটি ছাত্র তার পূর্ণ সম্ভাবনায় পৌঁছাতে পারে।"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;