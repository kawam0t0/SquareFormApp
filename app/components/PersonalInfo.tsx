"use client"

import type React from "react"
import { useState } from "react"
import { User, Mail, Phone, MapPin } from "lucide-react"
import type { BaseFormProps } from "../types"

const stores = [
  "SPLASH'N'GO!前橋50号店",
  "SPLASH'N'GO!伊勢崎韮塚店",
  "SPLASH'N'GO!高崎棟高店",
  "SPLASH'N'GO!足利緑町店",
]

export function PersonalInfo({ formData, updateFormData, nextStep, prevStep }: BaseFormProps) {
  const [errors, setErrors] = useState({
    familyName: "",
    givenName: "",
    email: "",
    phone: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      familyName: "",
      givenName: "",
      email: "",
      phone: "",
    }

    if (!/^[ァ-ヶー　]+$/.test(formData.familyName)) {
      newErrors.familyName = "姓は全角カタカナで入力してください。"
    }

    if (!/^[ァ-ヶー　]+$/.test(formData.givenName)) {
      newErrors.givenName = "名は全角カタカナで入力してください。"
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください。"
    }

    if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/[^\d]/g, ""))) {
      newErrors.phone = "電話番号は10桁または11桁の半角数字で入力してください。"
    }

    setErrors(newErrors)

    if (Object.values(newErrors).every((error) => error === "")) {
      nextStep()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="form-grid">
        <div>
          <label htmlFor="store" className="select-label">
            <MapPin className="h-6 w-6" />
            入会店舗
          </label>
          <div className="select-wrapper">
            <select
              id="store"
              value={formData.store}
              onChange={(e) => updateFormData({ store: e.target.value })}
              required
              className="custom-select"
            >
              <option value="">選択してください</option>
              {stores.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="familyName" className="form-label flex items-center gap-2">
            <User className="h-6 w-6" />姓
          </label>
          <input
            id="familyName"
            type="text"
            placeholder="全角カタカナ"
            value={formData.familyName}
            onChange={(e) => updateFormData({ familyName: e.target.value })}
            required
            className="form-input"
          />
          {errors.familyName && <p className="text-red-500 text-sm mt-2">{errors.familyName}</p>}
        </div>

        <div>
          <label htmlFor="givenName" className="form-label flex items-center gap-2">
            <User className="h-6 w-6" />名
          </label>
          <input
            id="givenName"
            type="text"
            placeholder="全角カタカナ"
            value={formData.givenName}
            onChange={(e) => updateFormData({ givenName: e.target.value })}
            required
            className="form-input"
          />
          {errors.givenName && <p className="text-red-500 text-sm mt-2">{errors.givenName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="form-label flex items-center gap-2">
            <Mail className="h-6 w-6" />
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            placeholder="例：example@email.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            required
            className="form-input"
          />
          {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="form-label flex items-center gap-2">
            <Phone className="h-6 w-6" />
            電話番号
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="半角数字のみ"
            value={formData.phone}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/[^\d]/g, "")
              updateFormData({ phone: onlyNumbers })
            }}
            required
            className="form-input"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
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

