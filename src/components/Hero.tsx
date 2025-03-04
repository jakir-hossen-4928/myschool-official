import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Confetti from 'react-confetti-boom';

interface ResultData {
  Name: string;
  School: string;
  "Roll No": number;
  Mark: number;
  Rank: string;
  "Price Money": string;
}

const resultsData: ResultData[] = [

  {
    "Name": "জাকিয়া সুলতানা",
    "School": "চিওড়া সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 484,
    "Mark": 69,
    "Rank": "১ম",
    "Price Money": ""
  },
  {
    "Name": "মো: আব্দুল্লাহ আল নোমান",
    "School": "পায়েরখোলা সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 448,
    "Mark": 56,
    "Rank": "২য়",
    "Price Money": ""
  },
  {
    "Name": "কাজী তাকবীর আহমেদ",
    "School": "চিওড়া বালক সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 491,
    "Mark": 53,
    "Rank": "৩য়",
    "Price Money": ""
  },
  {
    "Name": "আহমেদ ইমতিয়াজ আবির",
    "School": "মাইস্কুল",
    "Roll No": 411,
    "Mark": 42,
    "Rank": "৪র্থ",
    "Price Money": ""
  },
  {
    "Name": "মোস্তাফিজুর রহমান",
    "School": "কাকৈর খোলা নিউ লাইফ একাডেমি",
    "Roll No": 472,
    "Mark": 33,
    "Rank": "৫ম",
    "Price Money": ""
  },
  {
    "Name": "কুশান চন্দ্রশীল",
    "School": "সোনাপুর সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 336,
    "Mark": 23,
    "Rank": "৬ষ্ঠ",
    "Price Money": ""
  },
  {
    "Name": "আনিসুর রহমান",
    "School": "নোয়াপুর সরকারী প্রাথমিক বিদ্যালয়",
    "Roll No": 408,
    "Mark": 35,
    "Rank": "৭ম",
    "Price Money": ""
  },
  {
    "Name": "সুমাইয়া ইসলাম",
    "School": "নগর শরীফ সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 403,
    "Mark": 42,
    "Rank": "৮ম",
    "Price Money": ""
  },
  {
    "Name": "জান্নাতুল ফেরদৌস জেরিন",
    "School": "ইসলাইল চৌধুরী কিন্ডার গার্ডেন",
    "Roll No": 484,
    "Mark": 41,
    "Rank": "৯ম",
    "Price Money": ""
  },
  {
    "Name": "আবু বক্কর আবরার",
    "School": "কাদেরিয়া ইসলামিয়া দাখিল মাদ্রাসা",
    "Roll No": 419,
    "Mark": 14,
    "Rank": "১০ম",
    "Price Money": ""
  },
  {
    "Name": "ফাতেমা আক্তার মোহনা",
    "School": "সৈয়দ আঞ্জুমারা বালিকা বিদ্যালয়",
    "Roll No": 429,
    "Mark": 38,
    "Rank": "১১তম",
    "Price Money": ""
  },
  {
    "Name": "রাশেদুল ইসলাম",
    "School": "ধোরকড়া সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 483,
    "Mark": 31,
    "Rank": "১২তম",
    "Price Money": ""
  },
  {
    "Name": "মো:আল সাবাব",
    "School": "ঝাটিয়ারখিল সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 418,
    "Mark": 45,
    "Rank": "১৩তম",
    "Price Money": ""
  },
  {
    "Name": "আজমাইন মাহমুদ",
    "School": "ঘোষতল সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 426,
    "Mark": 47,
    "Rank": "১৪তম",
    "Price Money": ""
  },
  {
    "Name": "সৈয়দ উম্মে বুশরা",
    "School": "আতাকরা সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 432,
    "Mark": 39,
    "Rank": "১৫তম",
    "Price Money": ""
  },
  {
    "Name": "তানজীর মজুমদার সিফাত",
    "School": "চাইল্ড কেয়ার একাডেমী",
    "Roll No": 458,
    "Mark": 33,
    "Rank": "১৬তম",
    "Price Money": ""
  },
  {
    "Name": "উম্মে আফসানা তাসফি",
    "School": "পায়ের খোলা বালক সরকারি প্রাথমিক বিদ্যালয়",
    "Roll No": 440,
    "Mark": 41,
    "Rank": "১৮তম",
    "Price Money": ""
  },
  {
    "Name": "তানাজ মজুমদার",
    "School": "ধোরকড়া রেসিডেন্সিয়াল স্কুল",
    "Roll No": 423,
    "Mark": 52,
    "Rank": "১৯তম",
    "Price Money": ""
  },
  {
    "Name": "তাসনিম জাহান মিম",
    "School": "ধোরকড়া রেসিডেন্সিয়াল স্কুল",
    "Roll No": 422,
    "Mark": 52,
    "Rank": "২০তম",
    "Price Money": ""
  }

];

const Hero = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [searchResult, setSearchResult] = useState<ResultData | null>(null);
  const [searched, setSearched] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchRollNumber = parseInt(rollNumber);
    const result = resultsData.find((r) => r["Roll No"] === searchRollNumber);
    setSearchResult(result || null);
    setSearched(true);

    if (!result) {
      toast({
        title: "ফলাফল পাওয়া যায়নি",
        description: "রোল নাম্বারটি ডিসকোয়ালিফাই হয়েছে।",
      });
    } else {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleSearchAgain = () => {
    setSearchResult(null);
    setSearched(false);
    setRollNumber("");
  };

  return (
    <>
      <div id="home" className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-sky-600 py-24 sm:py-32">
        {showConfetti && <Confetti particleCount={50} colors={['#FFD700', '#FF69B4', '#4169E1', '#32CD32']} />}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animate-fade-up mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              মাইস্কুলে স্বাগতম
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              মননশীল মন গঠন, ভবিষ্যত নির্মাণ। আমরা শিক্ষার্থীদের সর্বোচ্চ সম্ভাবনা অর্জনে সহায়তা করি।
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#contact"
                className="rounded-md bg-yellow-400 px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                যোগাযোগ করুন
              </a>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <button className="text-sm font-semibold leading-6 text-white hover:text-yellow-200">
                    বৃত্তির ফলাফল দেখুন <span aria-hidden="true">→</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">
                      {searched && searchResult ? 'আপনার ফলাফল' : 'আপনার ফলাফল দেখুন'}
                    </DialogTitle>
                  </DialogHeader>
                  {!searched || !searchResult ? (
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">রোল নম্বর লিখুন</label>
                        <Input
                          type="number"
                          placeholder="'484'এইভাবে রোল নাম্বার লিখুন"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="text-lg"
                          min="1"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                        ফলাফল খুঁজুন
                      </Button>
                    </form>
                  ) : (
                    <>
                      <Card className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardContent className="p-6 space-y-4">
                          <div className="text-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-600">অভিনন্দন! 🎉</h3>
                            <p className="text-sm text-gray-600">আপনার ফলাফল পাওয়া গেছে</p>
                          </div>
                          <div className="space-y-3 divide-y divide-gray-200">
                            <div className="flex justify-between py-2">
                              <span className="font-medium text-gray-600">নাম:</span>
                              <span className="text-gray-900">{searchResult.Name}</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="font-medium text-gray-600">স্কুল:</span>
                              <span className="text-gray-900">{searchResult.School}</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="font-medium text-gray-600">রোল নম্বর:</span>
                              <span className="text-gray-900">{searchResult["Roll No"]}</span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="font-medium text-gray-600">র‍্যাংক:</span>
                              <span className="text-green-600 font-bold">{searchResult.Rank}</span>
                            </div>
                            {searchResult["Price Money"] && (
                              <div className="flex justify-between py-2">
                                <span className="font-medium text-gray-600">পুরস্কারের অর্থ:</span>
                                <span className="text-blue-600 font-bold">{searchResult["Price Money"]}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      <Button
                        onClick={handleSearchAgain}
                        className="w-full mt-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                      >
                        নতুন রোল নম্বর দিয়ে খুঁজুন
                      </Button>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;