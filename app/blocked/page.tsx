"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, MessageCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlockedPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("dental_clinic_auth");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-lg bg-[#121212]/80 border-[#222] backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 animate-gradient-x" />
        
        <CardContent className="pt-12 pb-10 px-8 text-center">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Hisobingiz <span className="text-red-500">Bloklandi</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Xavfsizlik qoidalari yoki to'lov bilan bog'liq muammolar tufayli tizimga kirishingiz cheklangan.
            Iltimos, administrator bilan bog'laning.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <Button 
              className="h-14 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => window.open('https://t.me/admin_username', '_blank')}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Administrator bilan bog'lanish
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-12 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              onClick={handleLogout}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Chiqish va qaytadan urinish
            </Button>
          </div>
        </CardContent>

        <div className="bg-[#1a1a1a] p-4 text-center border-t border-[#222]">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">
            Dental Clinic Management System v1.0
          </p>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
