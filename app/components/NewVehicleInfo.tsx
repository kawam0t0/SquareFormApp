"use client"

import type React from "react"
import { useState } from "react"
import { Car, Palette, FileText } from "lucide-react"
import type { BaseFormProps } from "../types"

const topCarModels = [
  "カローラ",
  "プリウス",
  "ノート",
  "フィット",
  "アクア",
  "スイフト",
  "タント",
  "ヤリス",
  "ステップワゴン",
  "シエンタ",
  "CX-5",
  "インプレッサ",
  "セレナ",
  "ヴォクシー",
  "ヴェゼル",
  "ワゴンR",
  "ハリアー",
  "デイズ",
  "N-BOX",
  "ライズ",
]

const carColors = ["白系", "黒系", "赤系", "青系", "黄系", "紫系", "緑系", "茶系", "紺系", "グレー系", "シルバー系"]

export function NewVehicleInfo({ formData, updateFormData, nextStep, prevStep }: BaseFormProps) {
  const [isCustomModel, setIsCustomModel] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const handleCarModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === "その他") {
      setIsCustomModel(true)
      updateFormData({ newCarModel: "" })
    } else {
      setIsCustomModel(false)
      updateFormData({ newCarModel: value })
    }
  }

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").slice(0, 4)
    updateFormData({ newLicensePlate: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 form-container">
      <div>
        <label htmlFor="newCarModel" className="select-label">
          <Car className="w-5 h-5" />
          新しい車種{" "}
          <span className="text-sm md:text-base lg:text-lg font-normal text-gray-500 ml-2">
            (無い場合はその他を選択してください)
          </span>
        </label>
        <div className="select-wrapper min-w-[280px]">
          <select
            id="newCarModel"
            value={isCustomModel ? "その他" : formData.newCarModel}
            onChange={handleCarModelChange}
            required
            className="custom-select"
          >
            <option value="">選択してください</option>
            {topCarModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            <option value="その他">その他</option>
          </select>
        </div>
      </div>

      {isCustomModel && (
        <div>
          <label htmlFor="customNewCarModel" className="select-label">
            その他の車種
          </label>
          <input
            id="customNewCarModel"
            type="text"
            value={formData.newCarModel}
            onChange={(e) => updateFormData({ newCarModel: e.target.value })}
            required
            className="form-input"
            placeholder="車種を入力してください"
          />
        </div>
      )}

      <div>
        <label htmlFor="newCarColor" className="select-label">
          <Palette className="w-5 h-5" />
          新しい車の色
        </label>
        <div className="select-wrapper min-w-[280px]">
          <select
            id="newCarColor"
            value={formData.newCarColor}
            onChange={(e) => updateFormData({ newCarColor: e.target.value })}
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

      <div>
        <label htmlFor="newLicensePlate" className="form-label flex items-center gap-2">
          <FileText className="w-5 h-5" />
          新しいナンバープレート（下4桁）
        </label>
        <p className="text-sm text-gray-500 mb-2">＊4桁以外の方は合計で4桁になるよう0を加えて下さい（例：10➛0010）</p>
        <input
          id="newLicensePlate"
          type="text"
          value={formData.newLicensePlate || ""}
          onChange={handleLicensePlateChange}
          required
          className="form-input"
          placeholder="例：1234"
          maxLength={4}
          pattern="\d{4}"
        />
      </div>

      <div className="pt-4 grid grid-cols-2 gap-3">
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

