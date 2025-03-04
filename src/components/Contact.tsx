import { Facebook, Mail, Phone, MessageCircle } from "lucide-react";

const Contact = () => {
  const whatsappUrl = "https://wa.me/8801866882842"; // Replace with your WhatsApp number

  return (
    <div id="contact" className="py-24 sm:py-32 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            আমাদের সাথে যোগাযোগ করুন
          </h2>
          <p className="mt-6 text-lg leading-8 text-white">
            আমরা আপনার মতামত শোনার জন্য অপেক্ষা করছি। আমাদের সাথে যোগাযোগ করতে আপনি নিচের যেকোনো মাধ্যমে পৌঁছাতে পারেন।
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:mx-0">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Phone Section */}
            <a
              href="tel:01866882842"
              className="flex items-center gap-x-4 rounded-lg bg-white/10 backdrop-blur-lg p-6 hover:bg-white/20 transition-colors"
            >
              <Phone className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-white">ফোন</h3>
                <p className="mt-1 text-white/80">01866882842</p>
              </div>
            </a>

            {/* Email Section */}
            <a
              href="mailto:myschoolcheorabazar@gmail.com"
              className="flex items-center gap-x-4 rounded-lg bg-white/10 backdrop-blur-lg p-6 hover:bg-white/20 transition-colors"
            >
              <Mail className="h-6 w-6 text-white" />
              <div className="truncate">
                <h3 className="font-semibold text-white">ইমেইল</h3>
                <p className="mt-1 text-white/80">myschoolcheorabazar@gmail.com</p>
              </div>
            </a>

            {/* Facebook Section */}
            <a
              href="https://www.facebook.com/profile.php?id=61570629429566"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-4 rounded-lg bg-white/10 backdrop-blur-lg p-6 hover:bg-white/20 transition-colors"
            >
              <Facebook className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-white">ফেসবুক</h3>
                <p className="mt-1 text-white/80">আমাদের অনুসরণ করুন</p>
              </div>
            </a>

            {/* WhatsApp Section */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-4 rounded-lg bg-white/10 backdrop-blur-lg p-6 hover:bg-white/20 transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-white">WhatsApp</h3>
                <p className="mt-1 text-white/80">আমাদের মেসেজ করুন</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;