"use client"

import Image from "next/image"
import type { BaseFormProps } from "../types"

export function NGVehicleCheck({ prevStep, nextStep }: BaseFormProps) {
  return (
    <div className="form-section space-y-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Image
          src="/images/ng-vehicles.png"
          alt="NG車両（洗車対応ができない車両）"
          width={1200}
          height={800}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="space-y-2 text-center text-sm text-gray-600">
        <p>上記の車両は洗車サービスをご利用いただけません。ご確認の上、お申し込みください。</p>
        <p className="text-red-600 font-medium">
          上記の車両に該当しているにもかかわらず、申し込まれた場合、ご退会されるまでの洗車料金の返金は致し兼ねますのであらかじめご了承ください。
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={nextStep}
          className="w-full h-14 sm:h-16 text-lg sm:text-xl font-semibold rounded-2xl bg-primary text-white shadow-md hover:opacity-90 transition-all duration-200"
        >
          該当しません（お申し込みに進む）
        </button>
        <button
          type="button"
          onClick={prevStep}
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium rounded-2xl border-2 border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all duration-200"
        >
          戻る
        </button>
      </div>
    </div>
  )
}
