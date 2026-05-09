"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Sparkles, CheckCircle2, MessageCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionExpiredPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("dental_clinic_auth");
    window.location.href = "/login";
  };

  const features = [
    "Barcha bemorlar bazasiga kirish",
    "Davolash rejalari va moliyaviy hisobotlar",
    "Doktorlar va xodimlar boshqaruvi",
    "24/7 Texnik qo'llab-quvvatlash"
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px]" />
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Side: Info & Benefits */}
        <div className="flex flex-col justify-center text-left space-y-8 p-4">
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-2" />
              Obuna muddati tugadi
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Ishingizni <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                To'xtatib Qo'ymang
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md">
              Klinikangiz samaradorligini oshirish va barcha mijozlar ma'lumotlariga qayta kirish uchun obunani yangilang.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-300">
                <div className="mr-3 p-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Action Card */}
        <Card className="bg-[#111]/90 border-[#222] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-8 shadow-[0_10px_20px_rgba(59,130,246,0.3)]">
              <CreditCard className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Premium Reja</h2>
            <p className="text-gray-500 mb-8">Barcha cheklovlarni olib tashlang va professional boshqaruvni davom ettiring.</p>

            <div className="space-y-4">
              <Button 
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => window.open('https://t.me/admin_username', '_blank')}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Hozir To'lash
              </Button>
              
              <div className="flex items-center justify-center py-4">
                <div className="h-[1px] flex-grow bg-[#222]" />
                <span className="px-4 text-xs text-gray-600 uppercase font-bold tracking-widest">Yoki</span>
                <div className="h-[1px] flex-grow bg-[#222]" />
              </div>

              <Button 
                variant="outline"
                className="w-full h-12 border-[#333] hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Tizimdan Chiqish
              </Button>
            </div>
          </div>

          <div className="p-6 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between">
            <span className="text-xs text-gray-500">Xavfsiz To'lovlar</span>
            <div className="flex space-x-2">
              <div className="w-8 h-5 bg-[#1a1a1a] rounded-sm border border-[#222]" />
              <div className="w-8 h-5 bg-[#1a1a1a] rounded-sm border border-[#222]" />
              <div className="w-8 h-5 bg-[#1a1a1a] rounded-sm border border-[#222]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      <div className="absolute bottom-[15%] right-[10%] w-2 h-2 bg-purple-500 rounded-full animate-ping [animation-delay:1s]" />
    </div>
  );
}
