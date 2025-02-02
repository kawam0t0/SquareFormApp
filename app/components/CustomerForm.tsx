"use client"

import { useState } from "react"
import { Droplet } from "lucide-react"
import { ErrorMessage } from "../components/ErrorMessage"
import { OperationSelection } from "../components/OperationSelection"
import { PersonalInfo } from "../components/PersonalInfo"
import { VehicleInfo } from "../components/VehicleInfo"
import { PaymentInfo } from "../components/PaymentInfo"
import { Confirmation } from "../components/Confirmation"
import { ProgressBar } from "../components/ProgressBar"
import { CourseSelection } from "../components/CourseSelection"
import { ThankYou } from "../components/ThankYou"
import type { FormData } from "../types"

function generateReferenceId(store: string): string {
  const storePrefix =
    {
      "SPLASH'N'GO!前橋50号店": "001",
      "SPLASH'N'GO!伊勢崎韮塚店": "002",
      "SPLASH'N'GO!高崎棟高店": "003",
      "SPLASH'N'GO!足利緑町店": "004",
      "SPLASH'N'GO!新前橋店": "005",
    }[store] || "000"

  const randomPart = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")
  return storePrefix + randomPart
}

export function CustomerForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    operation: "",
    store: "",
    name: "",
    email: "",
    phone: "",
    carModel: "",
    carColor: "",
    cardToken: "",
    referenceId: "",
    course: "",
  })
  const [error, setError] = useState<string | null>(null)

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...data }
      if (data.store) {
        newData.referenceId = generateReferenceId(data.store)
      }
      return newData
    })
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const submitForm = async () => {
    try {
      setError(null)
      console.log("送信するフォームデータ:", formData)

      const response = await fetch("/api/create-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `応答ステータスコードが正常ではありませんでした: ${response.status}`)
      }

      if (data.success) {
        setStep(7)
      } else {
        throw new Error(data.error || "顧客情報の登録に失敗しました")
      }
    } catch (error) {
      console.error("フォーム送信エラー:", error)
      setError(error instanceof Error ? error.message : "フォームの送信中にエラーが発生しました")
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OperationSelection formData={formData} updateFormData={updateFormData} nextStep={nextStep} />
      case 2:
        return (
          <PersonalInfo formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
        )
      case 3:
        return (
          <VehicleInfo formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
        )
      case 4:
        return (
          <CourseSelection
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 5:
        return (
          <PaymentInfo formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
        )
      case 6:
        return <Confirmation formData={formData} prevStep={prevStep} submitForm={submitForm} />
      case 7:
        return <ThankYou />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="header sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center flex items-center justify-center py-4">
          <Droplet className="mr-2 h-6 w-6" />
          顧客情報フォーム
        </h1>
      </div>
      <div className="w-full max-w-[375px] mx-auto bg-white min-h-[calc(100vh-4rem)] shadow-sm">
        <div className="px-4 py-6">
          {step < 7 && <ProgressBar currentStep={step} totalSteps={6} />}
          {error && <ErrorMessage message={error} />}
          <div className="mt-4">{renderStep()}</div>
        </div>
      </div>
    </div>
  )
}

