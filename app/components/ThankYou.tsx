import { CheckCircle } from "lucide-react"

export function ThankYou() {
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
      </p>
      <div className="pt-4">
        <a href="/" className="btn btn-primary">
          ホームに戻る
        </a>
      </div>
    </div>
  )
}

