"use client"

import Link from "next/link"

import { useState } from "react"
import {
  MapPin,
  User,
  Mail,
  Phone,
  Car,
  Palette,
  CreditCard,
  CheckCircle,
  FileText,
  Calendar,
  Gift,
} from "lucide-react"
import type React from "react"
import type { FormData } from "../types"
import TermsDialog from "./TermsDialog"

interface ConfirmationProps {
  formData: FormData
  prevStep: () => void
  submitForm: () => void
}

interface ConfirmationItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

const ConfirmationItem = ({ icon, label, value }: ConfirmationItemProps) => (
  <div className="flex items-center gap-4">
    <div className="text-primary">{icon}</div>
    <div className="space-y-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-base font-medium text-gray-900">{value}</div>
    </div>
  </div>
)

export function Confirmation({ formData, prevStep, submitForm }: ConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAgreed, setIsAgreed] = useState(false)
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting || !isAgreed) return
    setIsSubmitting(true)
    setError(null) // エラーをリセット

    try {
      await submitForm()
    } catch (err) {
      console.error("フォーム送信エラー:", err)
      setError(err instanceof Error ? err.message : "エラーが発生しました。お手数ですが、最初からやり直してください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  // コース名と価格を抽出
  const courseName = formData.course.split("（")[0].trim()
  const coursePrice = formData.course.includes("980円")
    ? "980円"
    : formData.course.includes("1280円")
      ? "1280円"
      : formData.course.includes("1480円")
        ? "1480円"
        : formData.course.includes("2980円")
          ? "2980円"
          : ""

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2 text-sm">お手数ですが、最初からやり直してください。</p>
        </div>
      )}
      <div className="text-center space-y-2">
        <CheckCircle className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold text-primary">確認</h2>
      </div>

      <div className="bg-blue-50/80 rounded-2xl p-6 space-y-6">
        <ConfirmationItem icon={<MapPin className="w-6 h-6" />} label="入会店舗" value={formData.store} />
        <ConfirmationItem icon={<User className="w-6 h-6" />} label="姓" value={`${formData.familyName}`} />
        <ConfirmationItem icon={<User className="w-6 h-6" />} label="名" value={formData.givenName} />
        <ConfirmationItem icon={<Mail className="w-6 h-6" />} label="メールアドレス" value={formData.email} />
        {formData.operation === "メールアドレス変更" && (
          <ConfirmationItem
            icon={<Mail className="w-6 h-6" />}
            label="新しいメールアドレス"
            value={formData.newEmail}
          />
        )}
        <ConfirmationItem icon={<Phone className="w-6 h-6" />} label="電話番号" value={formData.phone} />
        <ConfirmationItem icon={<Car className="w-6 h-6" />} label="車種" value={formData.carModel} />
        <ConfirmationItem icon={<Palette className="w-6 h-6" />} label="車の色" value={formData.carColor} />

        {formData.operation === "入会" && (
          <>
            <ConfirmationItem
              icon={<CreditCard className="w-6 h-6" />}
              label="選択されたコース"
              value={formData.course}
            />
            {/* キャンペーン情報の表示 */}
            {formData.store === "SPLASH'N'GO!新前橋店" && formData.campaignCode === "SPGO418" && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                <div className="flex">
                  <Gift className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 font-medium">🎉 キャンペーン適用中！</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      プレミアムスタンダードが2ヶ月無料！3ヶ月目から月額980円となります。
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">キャンペーンコード: {formData.campaignCode}</p>
                  </div>
                </div>
              </div>
            )}
            {formData.enableSubscription && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex">
                  <Calendar className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">定期支払い（月額自動引き落とし）</p>
                    <p className="text-sm text-green-600 mt-1">
                      選択されたコース「{courseName}」の月額料金 {coursePrice}が毎月自動的に引き落とされます。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {formData.operation === "登録車両変更" && (
          <>
            <ConfirmationItem icon={<Car className="w-6 h-6" />} label="新しい車種" value={formData.newCarModel} />
            <ConfirmationItem
              icon={<Palette className="w-6 h-6" />}
              label="新しい車の色"
              value={formData.newCarColor}
            />
          </>
        )}

        {formData.operation === "洗車コース変更" && (
          <>
            <ConfirmationItem
              icon={<CreditCard className="w-6 h-6" />}
              label="現在のコース"
              value={formData.currentCourse}
            />
            <ConfirmationItem
              icon={<CreditCard className="w-6 h-6" />}
              label="新しいコース"
              value={formData.newCourse}
            />
          </>
        )}

        {formData.operation === "クレジットカード情報変更" && (
          <ConfirmationItem
            icon={<CreditCard className="w-6 h-6" />}
            label="新しいクレジットカード情報"
            value="登録済み"
          />
        )}

        {formData.operation === "各種手続き" && (
          <>
            {formData.inquiryType && (
              <ConfirmationItem
                icon={<FileText className="w-6 h-6" />}
                label="お問い合わせの種類"
                value={formData.inquiryType}
              />
            )}
            {formData.inquiryType === "解約" &&
              formData.cancellationReasons &&
              formData.cancellationReasons.length > 0 && (
                <ConfirmationItem
                  icon={<FileText className="w-6 h-6" />}
                  label="解約理由"
                  value={formData.cancellationReasons.join(", ")}
                />
              )}
            <ConfirmationItem
              icon={<FileText className="w-6 h-6" />}
              label={formData.inquiryType === "解約" ? "その他ご意見・ご要望" : "お問い合わせ内容"}
              value={formData.inquiryDetails || ""}
            />
          </>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">
            {isAgreed ? (
              <span className="flex items-center text-green-600 font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                利用規約に同意しました
              </span>
            ) : (
              <span>
                サービスをご利用いただくには、利用規約への同意が必要です。
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => setIsTermsDialogOpen(true)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isAgreed
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            }`}
          >
            {isAgreed ? "利用規約を再確認する" : "利用規約を確認して同意する"}
          </button>
          {formData.enableSubscription && (
            <p className="mt-3 text-xs text-red-600 font-medium">
              ※
              定期支払いを選択したことにより、毎月自動的に料金が引き落とされることに同意します。
            </p>
          )}
        </div>
      </div>

      <TermsDialog
        isOpen={isTermsDialogOpen}
        onClose={() => setIsTermsDialogOpen(false)}
        onAgree={() => {
          setIsAgreed(true)
          setIsTermsDialogOpen(false)
        }}
      />

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={isSubmitting}
          className="w-full h-14 rounded-xl border-2 border-gray-200 text-gray-700 bg-white
                 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          戻る
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isAgreed || error !== null}
          className="w-full h-14 rounded-xl bg-primary text-white
           hover:bg-primary/90 transition-colors duration-200 
           disabled:opacity-50 disabled:cursor-not-allowed
           flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
              送信中...
            </>
          ) : (
            "同意して送信"
          )}
        </button>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="w-full h-14 rounded-xl border-2 border-gray-300 text-gray-600 bg-white
                 hover:bg-gray-50 transition-colors duration-200"
        >
          初めに戻る
        </button>
      </div>
    </div>
  )
}
