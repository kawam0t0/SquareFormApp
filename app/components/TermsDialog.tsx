"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"

interface TermsDialogProps {
  isOpen: boolean
  onClose: () => void
  onAgree: () => void
}

export default function TermsDialog({
  isOpen,
  onClose,
  onAgree,
}: TermsDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
    }
  }, [isOpen])

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      // 最後から20px以内までスクロールしたら同意ボタンを有効化
      if (scrollHeight - scrollTop - clientHeight < 20) {
        setHasScrolledToBottom(true)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">
            サブスク利用規約
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-gray-700"
        >
          <h3 className="font-bold text-base mb-4">第1条(目的)</h3>
          <p className="mb-6">
            「サブスクメンバーズ」は、株式会社Splash
            Brothers(以下「本部」という。)が運営する「
            SPLASH'N'GO！」もしくは本部により許諾を受けた
            「SPLASH'N'GO！フランチャイズ加盟店」（以下「加盟店」という。）の店舗が提供する洗車利用し放題サービスです。会員が本サービスを本部及び各加盟店で享受することにより、会員自身が洗車する場合の煩わしさから解放することを目的とします。
          </p>

          <h3 className="font-bold text-base mb-4">第2条(独立運営)</h3>
          <p className="mb-6">
            本部及び加盟店はそれぞれが独立した運営をするものであり、各店舗におけるサブスクメンバーズ以外のサービスについては、設備等が異なります。本利用規約は本部が作成したものであり、「サブスクメンバーズ」サービスを利用する本部及び加盟店の顧客(会員)に対するものです。
          </p>

          <h3 className="font-bold text-base mb-4">第3条(会員制)</h3>
          <p className="mb-6">
            本サービスは会員制であり、サービスを利用する際は店舗に会員証を提示する必要があります。会員証があれば本部及び加盟店のいずれの店舗においても
            利用できます。利用は１日につき１回までです。また、初回登録時に記載された車両のみがサービスの対象となります。登録車両であれば、運転者は会員登録者である必要はございません。
          </p>

          <h3 className="font-bold text-base mb-4">第4条(入会資格)</h3>
          <p className="mb-4">
            次の各号のいずれかに該当する事項がある場合は、入会することができません。また、入会後に判明した場合は、サービスの提供を終了する場合があります。
          </p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>本規約および利用する店舗のルールを遵守出来ない者</li>
            <li>
              入会時に登録された車両以外の車両でサービスを受けようとする者
            </li>
            <li>
              暴力団または反社会的勢力に属し、またそれらに属するものと関係を有する者と本部、または各加盟店が判断した場合
            </li>
            <li>18歳未満の者</li>
            <li>
              医師等により車の運転を禁じられている者が車両を運転している場合
            </li>
            <li>
              その他、本部または加盟店が上記に準じるような事由を有するなど会員としてふさわしくないと判断した者
            </li>
          </ol>

          <h3 className="font-bold text-base mb-4">第5条(会費と利用期間)</h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              サービスの内容に準じた会費を支払うことにより本サービスを利用することが出来ます。
            </li>
            <li>
              会費は月額制とし、支払いをした日が利用期間の開始日となります。
            </li>
            <li>
              利用可能期間は、開始日から翌月の開始日に相当する日の前日までの１か月間となります(以下「利用期間」という。)。
            </li>
            <li>
              開始日から起算し、利用期間の終了日(以下「期限日」という。)までサービスを利用できます。
            </li>
            <li>
              会費は退会手続きが行われるまで登録時に指定した「お支払い方法(クレジットカード)」より請求が行われます。
            </li>
            <li>
              会費の支払いが滞った際はサービスの利用を停止し、未決済分について会員様が支払義務を負うものとします。また、期限日前に退会手続きが完了している場合を除き、第６条「会費の支払方法」により引き続き請求を行うことを許可し、その場合の未決済金について引き続き会員が支払義務を負うものとします。
            </li>
          </ol>

          <h3 className="font-bold text-base mb-4">第6条(会費の支払方法)</h3>
          <p className="mb-6">会費は、クレジットカードで支払います。</p>

          <h3 className="font-bold text-base mb-4">第7条(会員種類と変更)</h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              会員には会費に準じた種類(以下「プラン」という。)がある加盟店があり、
              その場合はプランごとに利用できるサービスが異なります。
            </li>
            <li>
              プランの変更はいずれの日でも可能ですが、プランの変更の適用日はその時点の「次回更新日」が変更適用日となります。変更後、次回更新日に変更後のプランに準じた会費が発生します。
            </li>
            <li>
              変更前のプランの期限日以前に変更が行われた場合において、変更前のプランに対しての払い戻しやクレジット付与等の清算は行いません。
            </li>
          </ol>

          <h3 className="font-bold text-base mb-4">第8条 (退会)</h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              退会のお手続きは、会員証のQRコード又は、ホームページにて可能です。退会に対しての費用は発生しません。
            </li>
            <li>
              退会手続が完了した場合、更新日まで利用することができます。退会後のプランに対しての日割りでの払い戻しやクレジット付与等は行いません。
            </li>
            <li>
              退会時、会費の未決済がある場合は、未決済金について引き続き会員が支払義務を負うものとします。
            </li>
          </ol>

          <h3 className="font-bold text-base mb-4">
            第9条 (サービスの提供の停止と責任)
          </h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              本部または加盟店の判断によって利用期間中であっても、直ちにサービスの利用を停止することができるものとします。
            </li>
            <li>
              主に以下のような事態又は行為が見られた場合は、サービスの提供を停止することができます。
              <ol className="list-none pl-4 mt-2 space-y-2">
                <li>
                  (1)
                  悪天候、災害、事件、洗車機の故障等により、安全にサービスの提供ができないと店舗が判断した場合。
                </li>
                <li>
                  (2) 安全とは見られない車両の運転を利用者が行った場合。
                </li>
                <li>
                  (3) 周囲に迷惑を及ぼしている行為を利用者が行った場合。
                </li>
                <li>
                  (4)
                  洗車及び店舗が提供するサービス以外の目的で店舗を利用した場合。
                </li>
                <li>(5) 営業時間外に無許可で店舗、設備を利用した場合。</li>
                <li>
                  (6) 店舗の備品等を店舗外に許可なく持ち出した場合。
                </li>
                <li>
                  (7)
                  次の理由により本部又は加盟店が車両を損傷させるおそれがあると判断した場合
                  <ul className="list-none pl-4 mt-2 space-y-1">
                    <li>
                      イ
                      ブラシの回転の仕方及びブラシの接触のタイミング等の設定の変更
                    </li>
                    <li>
                      ロ
                      本部及び加盟店におけるそれまでの利用の状況（例えばリアミラーは状態によってはブラシに絡まって損傷するおそれがあるためサービスの提供を停止しています。）
                    </li>
                  </ul>
                </li>
                <li>
                  (8)
                  本規約及び店舗ごとに定められたルールを遵守していない場合。
                </li>
              </ol>
            </li>
            <li>
              以下の場合は、本部及び加盟店は責任を負いません。
              <ol className="list-none pl-4 mt-2 space-y-2">
                <li>(1) 店舗利用時における利用者同士の事故</li>
                <li>(2) 自然損耗による損傷</li>
                <li>
                  (3) 洗車による水圧及びブラシの接触に伴い当然発生しうる損傷
                </li>
                <li>
                  (4) 洗車後に車両に付着する水滴及びワックス等の液剤によるシミ・汚れ
                </li>
                <li>
                  (5)
                  車両の既存の損傷または劣化箇所に対する洗車による風、水、ブラシの影響により生じた損傷
                </li>
                <li>
                  (6) 車両の塗装状況や形状により、ごく稀に発生する損傷
                </li>
                <li>
                  (7) 個人の貴重品を含めた所有物の損傷、紛失または盗難
                </li>
                <li>
                  (8) 本部または加盟店の指示に従わなかった場合の損傷及び事故
                </li>
                <li>
                  (9)
                  車両の仕様（ホイール、車高等を含む。）に変更があり、その変更が原因で生じた損傷
                </li>
              </ol>
            </li>
            <li>
              店舗の設備等を破損した場合は、それを修復する費用の支払義務を負っていただきます。
            </li>
            <li>
              洗車後に損傷が認められる場合は、店舗の過失が明らかなときはその店舗が賠償義務を負います。自然損耗による損傷を含めて店舗の過失がないときはその店舗は責任を有しません。店舗の過失が明らかではないときは、防犯カメラ等を確認した上で、過失及び賠償義務の有無等について誠実に協議します。
            </li>
          </ol>

          <h3 className="font-bold text-base mb-4">第10条(規約の変更)</h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>本規約は随時変更する場合がございます。</li>
            <li>
              本規約は店舗またはホームページにおいて公表し、メールにて通知します。
            </li>
          </ol>

          {/* スクロール促進メッセージ */}
          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 text-center">
              <p className="text-sm text-gray-500 animate-bounce">
                ↓ 最後までスクロールしてください ↓
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="border-t p-4 space-y-3">
          <button
            onClick={onAgree}
            disabled={!hasScrolledToBottom}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              hasScrolledToBottom
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {hasScrolledToBottom ? "同意する" : "最後までスクロールしてください"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
