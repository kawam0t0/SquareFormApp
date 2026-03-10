"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Car, Palette } from "lucide-react"
import type { BaseFormProps } from "../types"

const carColors = ["白系", "黒系", "赤系", "青系", "黄系", "紫系", "緑系", "茶系", "紺系", "灰系", "銀系"]

// 車種・車の色の入力が不要な操作
const SKIP_VEHICLE_OPERATIONS = ["クレジットカード情報変更", "メールアドレス変更", "洗車コース変更"]

export function VehicleInfo({ formData, updateFormData, nextStep, prevStep }: BaseFormProps) {
  const [carModelError, setCarModelError] = useState<string>("")
  const skipped = useRef(false)

  // スキップ対象の操作の場合は1度だけ次のステップへ
  useEffect(() => {
    if (SKIP_VEHICLE_OPERATIONS.includes(formData.operation) && !skipped.current) {
      skipped.current = true
      nextStep()
    }
  }, [])

  // スキップ対象の場合は何も描画しない
  if (SKIP_VEHICLE_OPERATIONS.includes(formData.operation)) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.carModel.length > 10) {
      setCarModelError("車種は10文字以内で入力してください。")
      return
    }

    if (!/^[ァ-ヶー　a-zA-Z0-9\s-]+$/.test(formData.carModel)) {
      setCarModelError("車種は全角カタカナまたはローマ字で入力してください。")
      return
    }

    nextStep()
  }

  const handleCarModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ carModel: e.target.value })
    setCarModelError("")
  }

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="form-grid">
        <div>
          <label htmlFor="carModel" className="form-label flex items-center gap-2">
            <Car className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
            車種
            <span className="text-sm md:text-base lg:text-lg font-normal text-gray-500 ml-2">
              (全角カタカナ/ローマ字で入力して下さい)
            </span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            ※メーカー名やグレード名ではなく、車種を記載ください（10文字以内）
          </p>
          <input
            id="carModel"
            type="text"
            value={formData.carModel}
            onChange={handleCarModelChange}
            required
            maxLength={10}
            className="form-input"
            placeholder="例：タント、BMW"
          />
          {carModelError && <p className="text-red-500 text-sm mt-2">{carModelError}</p>}
        </div>

        <div>
          <label htmlFor="carColor" className="select-label">
            <Palette className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
            車の色
          </label>
          <div className="select-wrapper">
            <select
              id="carColor"
              value={formData.carColor}
              onChange={(e) => updateFormData({ carColor: e.target.value })}
              required
              className="custom-select"
            >
              <option value="">選択してください</option>
              {carColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button type="button" onClick={prevStep} className="btn btn-secondary">
          戻る
        </button>
        <button type="submit" className="btn btn-primary">
          次へ
        </button>
      </div>
    </form>
  )
}
