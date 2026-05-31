"use client"

import { useState } from "react"
import { Check, Gift, Calendar, Star } from "lucide-react"
import type { BaseFormProps } from "../types"
import type React from "react"

// JST日時をUTC基準で比較するユーティリティ
// 例: JST 2026-04-25 00:00:00 = UTC 2026-04-24 15:00:00Z
function isAfterApril25(): boolean {
  return new Date() >= new Date("2026-04-24T15:00:00Z")
}

// 北関東キャンペーン: 終了済み（次回実施時はUTC基準で日付を更新）
const KITAKANTO_CAMPAIGN_START_UTC = "2099-01-01T15:00:00Z"
const KITAKANTO_CAMPAIGN_END_UTC   = "2099-01-01T14:59:59Z"

// 北関東エリアの全店舗（4/22以降に追加される藤岡大塚店も含む）
const KITAKANTO_STORES = [
  "SPLASH'N'GO!前橋50号店",
  "SPLASH'N'GO!伊勢崎韮塚店",
  "SPLASH'N'GO!高崎棟高店",
  "SPLASH'N'GO!足利緑町店",
  "SPLASH'N'GO!新前橋店",
  "SPLASH'N'GO!太田新田店",
  "SPLASH'N'GO!藤岡大塚店",
]

function isKitakantoCampaignActive(): boolean {
  const now = new Date()
  return now >= new Date(KITAKANTO_CAMPAIGN_START_UTC) && now <= new Date(KITAKANTO_CAMPAIGN_END_UTC)
}

function getDeluxeCourseName(): string {
  return isAfterApril25() ? "スーパーデラックス" : "セラミックコーティングタートルシェル"
}

function getAllCourses() {
  return [
    { id: "980",  name: "プレミアムスタンダード",   price: "980円" },
    { id: "1280", name: "コーティングプラス",       price: "1280円" },
    { id: "1480", name: "スーパーシャンプーナイアガラ", price: "1480円" },
    { id: "2980", name: getDeluxeCourseName(),      price: "2980円" },
  ]
}

// 制限付き店舗（プレミアムスタンダード・コーティングプラスの2コースのみ）
const limitedStores = [
  "SPLASH'N'GO!前橋50号店",
  "SPLASH'N'GO!伊勢崎韮塚店",
  "SPLASH'N'GO!足利緑町店",
  "SPLASH'N'GO!鹿児島中山店",
]

// 九州エリアの店舗（鹿児島中山店除く）＝キャンペーン対象
// ※現在は鹿児島中山店のみだが、今後追加される店舗に備えて配列管理
const KAGOSHIMA_STORE = "SPLASH'N'GO!鹿児島中山店"

// 鹿児島中山店キャンペーン（次回実施時はUTC基準で日付を更新。JST 00:00 = UTC前日 15:00Z）
const KAGOSHIMA_CAMPAIGN_START = "2099-01-01T15:00:00Z"
const KAGOSHIMA_CAMPAIGN_END   = "2099-01-01T14:59:59Z"
const KAGOSHIMA_CAMPAIGN_COURSES = [
  { id: "980",  name: "プレミアムスタンダード", normalPrice: "980" },
  { id: "1280", name: "コーティングプラス",     normalPrice: "1280" },
]

function isKagoshimaCampaignActive(): boolean {
  const now = new Date()
  return now >= new Date(KAGOSHIMA_CAMPAIGN_START) && now <= new Date(KAGOSHIMA_CAMPAIGN_END)
}

// 北関東キャンペーンのコース（4/22〜5/31）
function getKyushuCampaignCourses() {
  return [
    { id: "980",  name: "プレミアムスタンダード",      normalPrice: "980",  campaignPrice: "39" },
    { id: "1280", name: "コーティングプラス",          normalPrice: "1280", campaignPrice: "39" },
    { id: "1480", name: "スーパーシャンプーナイアガラ", normalPrice: "1480", campaignPrice: "399" },
    { id: "2980", name: getDeluxeCourseName(),         normalPrice: "2980", campaignPrice: "999" },
  ]
}

export function CourseSelection({ formData, updateFormData, nextStep, prevStep }: BaseFormProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  const allCourses = getAllCourses()
  const isKagoshima = formData.store === KAGOSHIMA_STORE
  const isKagoshimaCampaign = isKagoshima && isKagoshimaCampaignActive()
  // 北関東エリア全店舗がキャンペーン対象（4/22〜5/31）
  const isKitakantoCampaign = KITAKANTO_STORES.includes(formData.store) && isKitakantoCampaignActive()

  // 店舗に基づいてコースをフィルタリング
  const courses = limitedStores.includes(formData.store)
    ? allCourses.filter((course) => ["980", "1280"].includes(course.id))
    : allCourses

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCourse) {
      updateFormData({ course: selectedCourse })
      nextStep()
    } else {
      alert("コースを選択してください")
    }
  }

  // 北関東エリアキャンペーン 4/25〜5/31
  if (isKitakantoCampaign) {
    const allKitakantoCourses = getKyushuCampaignCourses()
    // 前橋50号店・伊勢崎韮塚店・足利緑町店はキャンペーン中も2コースのみ
    const kitakantoCourses = limitedStores.includes(formData.store)
      ? allKitakantoCourses.filter((c) => ["980", "1280"].includes(c.id))
      : allKitakantoCourses
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full mb-4">
            <Gift className="w-5 h-5" />
            <span className="font-bold text-base">北関東エリア限定OPENキャンペーン</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">洗車コースを選択</h2>
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold text-sm">
            <Calendar className="w-4 h-4" />
            <span>キャンペーン期間：4/25〜5/31</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kitakantoCourses.map((course) => (
            <div
              key={course.id}
              className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 border-4 cursor-pointer ${
                selectedCourse === course.name
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                  : "border-yellow-200 hover:border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
              }`}
              onClick={() => setSelectedCourse(course.name)}
            >
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span className="font-bold text-xs">限定特価</span>
              </div>
              <div className="p-8 flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{course.name}</h3>
                <div className="text-center">
                  <span className="text-base text-gray-400 line-through">月額{course.normalPrice}円</span>
                  <div className="text-4xl font-bold text-red-600 mb-1">月額{course.campaignPrice}円</div>
                  <div className="text-sm text-gray-600 mt-1">期間終了後 月額{course.normalPrice}円</div>
                </div>
              </div>
              {selectedCourse === course.name && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-white rounded-full p-1.5">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={prevStep} className="btn btn-secondary">
            戻る
          </button>
          <button type="submit" className="btn btn-primary bg-gradient-to-r from-yellow-500 to-orange-500">
            このコースで申し込む
          </button>
        </div>
      </form>
    )
  }

  // 鹿児島中山店キャンペーン期間中は専用UIを表示
  if (isKagoshimaCampaign) {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full mb-4">
            <Gift className="w-5 h-5" />
            <span className="font-bold text-base">鹿児島中山店限定OPENキャンペーン</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">洗車コースを選択</h2>
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold text-sm">
            <Calendar className="w-4 h-4" />
            <span>申込期間：{KAGOSHIMA_CAMPAIGN_START.slice(0, 10)} 〜 {KAGOSHIMA_CAMPAIGN_END.slice(0, 10)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            キャンペーン期間中にご入会で
            <span className="font-bold text-red-600"> 月額39円</span>！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {KAGOSHIMA_CAMPAIGN_COURSES.map((course) => (
            <div
              key={course.id}
              className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 border-4 cursor-pointer ${
                selectedCourse === course.name
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                  : "border-yellow-200 hover:border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
              }`}
              onClick={() => setSelectedCourse(course.name)}
            >
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span className="font-bold text-xs">限定特価</span>
              </div>
              <div className="p-8 flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{course.name}</h3>
                <div className="text-center">
                  <span className="text-base text-gray-400 line-through">月額{course.normalPrice}円</span>
                  <div className="text-4xl font-bold text-red-600 mb-1">月額39円</div>
                  <div className="text-sm text-gray-600 mt-1">期間終了後 月額{course.normalPrice}円</div>
                </div>
              </div>
              {selectedCourse === course.name && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-white rounded-full p-1.5">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={prevStep} className="btn btn-secondary">
            戻る
          </button>
          <button type="submit" className="btn btn-primary bg-gradient-to-r from-yellow-500 to-orange-500">
            このコースで申し込む
          </button>
        </div>
      </form>
    )
  }

  // 通常のコース選択UI
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">洗車コースを選択</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
              selectedCourse === (Array.isArray(course.name) ? course.name.join("") : course.name)
                ? "border-4 border-primary bg-primary/5"
                : "border border-gray-200 hover:border-primary/50"
            }`}
            onClick={() => setSelectedCourse(Array.isArray(course.name) ? course.name.join("") : course.name)}
          >
            <div className="p-6 cursor-pointer flex flex-col items-center justify-center h-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                {Array.isArray(course.name) ? (
                  <>
                    {course.name[0]}
                    <br />
                    {course.name[1]}
                  </>
                ) : (
                  course.name
                )}
              </h3>
              <div className="text-3xl font-bold text-primary">月額{course.price}</div>
            </div>

            {selectedCourse === (Array.isArray(course.name) ? course.name.join("") : course.name) && (
              <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-2">
                <Check className="w-6 h-6" />
              </div>
            )}
          </div>
        ))}
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
