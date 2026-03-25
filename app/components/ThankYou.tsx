"use client"

import { CheckCircle } from "lucide-react"
import type { FormData } from "../types"

interface ThankYouProps {
  formData: FormData
}

export function ThankYou({ formData }: ThankYouProps) {
  const isKagoshimaStore = formData.store === "SPLASH'N'GO!鹿児島中山店"

  return (
    <div className="text-center space-y-6">
      <div className="text-primary">
        <CheckCircle size={64} className="mx-auto" />
      </div>
      <h2 className="text-2xl font-semibold text-primary">ご登録ありがとうございました</h2>
      <p className="text-gray-600">
        お客様の情報が正常に登録されました。
        <br />
        ご利用ありがとうございます。
        <br />
        ご入会をされましたお客様はお申し込み頂きました店舗にて会員カードをお受け取り下さいませ。
        <br />
        <br />
        なお、各種お手続きを選択されたお客様は、
        <br />
        担当者より1営業日~2営業日以内に登録頂いておりますメールアドレスにご連絡させていただきます。
      </p>
      {isKagoshimaStore && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800">
            【鹿児島中山店限定】
            <br />
            無料期間中にお申し込み頂いたお客様は
            <br />
            <span className="text-red-600">4/20に39円が決済されます</span>
          </p>
        </div>
      )}
      <div className="pt-4">
        <a href="/" className="btn btn-primary">
          ホームに戻る
        </a>
      </div>
    </div>
  )
}
