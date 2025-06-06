"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import type { BaseFormProps } from "../types"
import type React from "react"

const allCourses = [
  {
    id: "980",
    name: "プレミアムスタンダード",
    price: "980円",
  },
  {
    id: "1280",
    name: "コーティングプラス",
    price: "1280円",
  },
  {
    id: "1480",
    name: "スーパーシャンプーナイアガラ",
    price: "1480円",
  },
  {
    id: "2980",
    name: ["セラミックコーティングタートル", "シェル"],
    price: "2980円",
  },
]

// 制限付き商品を提供する店舗
const limitedStores = ["SPLASH'N'GO!前橋50号店", "SPLASH'N'GO!伊勢崎韮塚店", "SPLASH'N'GO!足利緑町店"]

export function CourseSelection({ formData, updateFormData, nextStep, prevStep }: BaseFormProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

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
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">月額{course.price}</div>
              </div>
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
