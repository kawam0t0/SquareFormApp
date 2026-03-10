"use client"

import type React from "react"
import { User, Mail, Phone, Tag, Hash } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import type { BaseFormProps } from "../types"

// 入会以外の操作（既存顧客が必要な操作）
const EXISTING_CUSTOMER_OPERATIONS = [
  "登録車両変更",
  "洗車コース変更",
  "クレジットカード情報変更",
  "メールアドレス変更",
  "各種手続き",
]

export function PersonalInfo({ formData, updateFormData, nextStep, prevStep }: BaseFormProps) {
  const requiresReferenceId = EXISTING_CUSTOMER_OPERATIONS.includes(formData.operation)

  const [errors, setErrors] = useState({
    familyName: "",
    givenName: "",
    email: "",
    phone: "",
    campaignCode: "",
    referenceId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      familyName: "",
      givenName: "",
      email: "",
      phone: "",
      campaignCode: "",
      referenceId: "",
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

    // リファランスIDのバリデーション（既存顧客操作の場合は必須）
    if (requiresReferenceId) {
      if (!formData.referenceId || formData.referenceId.trim() === "") {
        newErrors.referenceId = "会員番号（リファランスID）は必須です。会員カードをご確認ください。"
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.referenceId)) {
        newErrors.referenceId = "リファランスIDは半角英数字で入力してください。"
      }
    }

    // キャンペーンコードのバリデーション
    if (
      formData.operation === "入会" &&
      formData.store === "SPLASH'N'GO!新前橋店" &&
      formData.campaignCode &&
      !/^[A-Z0-9]+$/.test(formData.campaignCode)
    ) {
      newErrors.campaignCode = "キャンペーンコードは半角英数字で入力してください。"
    }

    setErrors(newErrors)

    if (Object.values(newErrors).every((error) => error === "")) {
      nextStep()
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="form-section">
        {/* 入会の場合のみNG車両画像を表示 */}
        {formData.operation === "入会" && (
          <div className="mb-8">
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
            <p className="text-center text-sm text-gray-600 mt-4">
              上記の車両は洗車サービスをご利用いただけません。ご確認の上、お申し込みください。
            </p>
          </div>
        )}

        {/* キャンペーンコード入力欄（新前橋店かつ入会の場合のみ表示） */}
        {formData.operation === "入会" && formData.store === "SPLASH'N'GO!新前橋店" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-6 w-6 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-800">キャンペーンコード</span>
              <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">期間限定 8/1-8/31</span>
            </div>
            <input
              id="campaignCode"
              type="text"
              placeholder="半角英数字でご入力ください（例：SPGO418）"
              value={formData.campaignCode || ""}
              onChange={(e) => {
                // 半角英数字のみを許可
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                updateFormData({ campaignCode: value })
              }}
              className="w-full px-4 py-3 text-lg font-mono border-2 border-yellow-300 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 bg-white"
              maxLength={10}
            />
            {errors.campaignCode && <p className="text-sm text-red-500 mt-2">{errors.campaignCode}</p>}
            <p className="text-sm text-yellow-700 mt-2">※ キャンペーンコードをお持ちの方のみご入力ください</p>
          </div>
        )}

        <div className="form-grid">
          {/* リファランスID入力欄（既存顧客操作の場合のみ表示） */}
          {requiresReferenceId && (
            <div className="col-span-full">
              {/* 会員カード説明画像 */}
              <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src="/images/reference-id-guide.jpg"
                  alt="会員カードのリファランスID（No.）の場所を示す画像"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <label htmlFor="referenceId" className="form-label flex items-center gap-2">
                <Hash className="h-6 w-6" />
                会員番号（リファランスID）
                <span className="text-sm text-red-500 font-normal">※必須</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">
                会員カードのバーコード下またはカード裏面のNo.欄に記載されている番号を入力してください。
              </p>
              <input
                id="referenceId"
                type="text"
                placeholder="半角英数字（例：10011234567890）"
                value={formData.referenceId || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
                  updateFormData({ referenceId: value })
                }}
                className="form-input font-mono"
                maxLength={20}
              />
              {errors.referenceId && <p className="text-red-500 text-sm mt-2">{errors.referenceId}</p>}
            </div>
          )}
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
    </>
  )
}
