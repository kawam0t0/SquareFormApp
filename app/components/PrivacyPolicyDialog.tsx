"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronDown } from "lucide-react"

interface PrivacyPolicyDialogProps {
  isOpen: boolean
  onClose: () => void
  onAgree: () => void
}

export default function PrivacyPolicyDialog({
  isOpen,
  onClose,
  onAgree,
}: PrivacyPolicyDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      // スクロール位置が底に近い場合（50px以内）
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setHasScrolledToBottom(true)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            プライバシーポリシー
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* スクロール促進アニメーション */}
        {!hasScrolledToBottom && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <span className="text-sm font-medium">
              最後までスクロールしてください
            </span>
            <ChevronDown className="w-4 h-4" />
          </div>
        )}

        {/* コンテンツ */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-700 leading-relaxed"
        >
          <p className="text-sm">
            株式会社 Splash
            Brothers(以下「当社」といいます。)は、本ウェブサイト上及び当社が運営する店舗で提供するサービス(以下「本サービス」といいます。)における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー(以下「本ポリシー」といいます。)を定めます。
          </p>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第1条(個人情報)
            </h3>
            <p className="text-sm">
              「個人情報」とは、個人情報の保護に関する法律(以下「個人情報保護法」という。)2条1項で定める「個人情報」をいいます。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第2条(個人情報の取得方法)
            </h3>
            <p className="text-sm mb-3">
              当社は、ユーザーが本サービスを利用するために登録をする際に氏名、電話番号、メールアドレス、クレジットカードの番号等の個人情報をお尋ねすることがあります。また、ユーザーと当社の提携先(情報提供元、広告主、広告配信先等を含みます。以下「提携先」といいます。)との間でなされたユーザーの個人情報を含む取引記録及び決済に関する情報を、当社の提携先から取得することがあります。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第3条(個人情報を取得・利用する目的)
            </h3>
            <p className="text-sm mb-3">
              当社の登記上の目的において定める洗車場の運営の事業等について、当社が個人情報を取得・利用する目的(以下「利用目的」という。)は、以下のとおりです。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm pl-4">
              <li>
                本サービスの提供・運営のためユーザーからのお問い合わせに回答するため(本人確認を行うことを含む)
              </li>
              <li>
                ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため
              </li>
              <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
              <li>
                利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため
              </li>
              <li>有料サービスにおいて、ユーザーに利用料金を請求するため</li>
              <li>上記の利用目的に付随する目的のため</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第4条(利用目的の変更)
            </h3>
            <p className="text-sm">
              当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、ユーザーに通知し、又は本ウェブサイト上に公表するものとします。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第5条(個人情報の第三者提供)
            </h3>
            <p className="text-sm mb-3">
              当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm pl-4 mb-3">
              <li>
                人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
              </li>
              <li>
                公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
              </li>
              <li>
                国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
              </li>
              <li>
                予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき
                <ul className="list-none pl-6 mt-2 space-y-1">
                  <li>ア 利用目的に第三者への提供を含むこと</li>
                  <li>イ 第三者に提供されるデータの項目</li>
                  <li>ウ 第三者への提供の手段または方法</li>
                  <li>エ 本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                  <li>オ 本人の求めを受け付ける方法</li>
                </ul>
              </li>
            </ol>
            <p className="text-sm mb-3">
              2
              前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm pl-4">
              <li>
                当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合
              </li>
              <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
              <li>
                個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第6条(個人情報の開示)
            </h3>
            <p className="text-sm mb-3">
              当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
            </p>
            <p className="text-sm mb-3">
              ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
            </p>
            <p className="text-sm mb-3">
              なお、個人情報の開示に際しては、1件あたり1000円の手数料を申し受けます。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm pl-4 mb-3">
              <li>
                本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合
              </li>
              <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
              <li>その他法令に違反することとなる場合</li>
            </ol>
            <p className="text-sm">
              2
              前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第7条(個人情報の訂正および削除)
            </h3>
            <p className="text-sm mb-3">
              ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には当社が定める手続により当社に対して個人情報の訂正、追加または削除(以下「訂正等」といいます。)を請求することができます。
            </p>
            <p className="text-sm mb-3">
              2
              当社は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。
            </p>
            <p className="text-sm">
              3
              当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知します。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第8条(個人情報の利用停止等)
            </h3>
            <p className="text-sm mb-3">
              当社は、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由または不正の手段により取得されたものであるという理由によりその利用の停止または削除(以下「利用停止等」といいます。)を求められた場合には、遅滞なく必要な調査を行います。
            </p>
            <p className="text-sm mb-3">
              2
              前項の調査の結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。
            </p>
            <p className="text-sm">
              3
              前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとることができる場合は、この代替策を講じるものとします。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第9条(プライバシーポリシーの変更)
            </h3>
            <p className="text-sm">
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              第10条(お問合せ窓口)
            </h3>
            <p className="text-sm mb-2">
              本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
              <p>住所: 埼玉県川越市大字寺尾118-8</p>
              <p>社名: 株式会社 Splash Brothers</p>
              <p>代表取締役 中田将允</p>
              <p>E メールアドレス: info@splashbrothers.co.jp</p>
            </div>
          </section>

          {/* スクロール完了インジケーター */}
          {hasScrolledToBottom && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">
                最後までお読みいただきありがとうございます
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onAgree}
              disabled={!hasScrolledToBottom}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                hasScrolledToBottom
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {hasScrolledToBottom ? "同意する" : "最後までスクロールしてください"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
