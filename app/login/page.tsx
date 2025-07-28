"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("dental_clinic_auth")
    if (isLoggedIn === "true") {
      router.push("/")
    }

    // Check if user is blocked
    const blockData = localStorage.getItem("login_block")
    if (blockData) {
      const { blockedUntil, attempts } = JSON.parse(blockData)
      const now = Date.now()

      if (now < blockedUntil) {
        setIsBlocked(true)
        setTimeLeft(Math.ceil((blockedUntil - now) / 1000))
        setFailedAttempts(attempts)
      } else {
        // Block time expired, clear data
        localStorage.removeItem("login_block")
        setFailedAttempts(0)
      }
    }
  }, [router])

  // Countdown timer
  useEffect(() => {
    if (isBlocked && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBlocked(false)
            setFailedAttempts(0)
            localStorage.removeItem("login_block")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isBlocked, timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    if (formData.username === "dentist" && formData.password === "dashboard") {
      // Success
      localStorage.setItem("dental_clinic_auth", "true")
      localStorage.removeItem("login_block")
      router.push("/")
    } else {
      // Failed login
      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)

      if (newFailedAttempts >= 6) {
        // Block user for 2 hours
        const blockedUntil = Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        localStorage.setItem(
          "login_block",
          JSON.stringify({
            blockedUntil,
            attempts: newFailedAttempts,
          }),
        )
        setIsBlocked(true)
        setTimeLeft(2 * 60 * 60) // 2 hours in seconds
        setError("")
      } else {
        setError(`Noto'g'ri login yoki parol. Qolgan urinishlar: ${6 - newFailedAttempts}`)
      }
    }

    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Kirish bloklandi</CardTitle>
            <CardDescription className="text-gray-600">
              6 marta noto'g'ri urinish tufayli kirish 2 soatga bloklandi
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <div className="text-4xl font-mono font-bold text-red-600 mb-2">{formatTime(timeLeft)}</div>
              <p className="text-sm text-red-500">Qolgan vaqt</p>
            </div>
            <p className="text-sm text-gray-500">Vaqt tugaganidan keyin qayta urinib ko'rishingiz mumkin</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Dental Klinika CMS</CardTitle>
          <CardDescription className="text-gray-600">
            Tizimga kirish uchun login ma'lumotlarini kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Login</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Login kiriting"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Parol kiriting"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {failedAttempts > 0 && failedAttempts < 6 && (
              <Alert>
                <AlertDescription>Ogohlantirish: {failedAttempts}/6 noto'g'ri urinish</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Faqat tizim administratori uchun</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
