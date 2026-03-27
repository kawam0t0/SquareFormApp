import { NextResponse } from "next/server"
import { Client, Environment, ApiError } from "square"
import { appendToSheet } from "../../utils/google-sheets"
import { formatJapanDateTime } from "../../utils/date-utils"
import { sendInquiryConfirmationEmail } from "../../utils/email-sender"

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
})

// 日本の電話番号をE164形式に変換（例: 08012345678 → +818012345678）
function toE164Japan(phone?: string): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/[^\d]/g, "")
  if (digits.startsWith("0")) {
    return "+81" + digits.slice(1)
  }
  if (digits.startsWith("81")) {
    return "+" + digits
  }
  return "+" + digits
}

// 車種/色 → "車種/色"
function buildCompanyName(model?: string, color?: string): string | undefined {
  const m = (model || "").trim()
  const c = (color || "").trim()
  if (m && c) return `${m}/${c}`
  if (m) return m
  if (c) return c
  return undefined
}

// 氏名（姓）に「車種/姓」をセットするためのヘルパー
function buildFamilyNameWithModel(familyName?: string, model?: string): string | undefined {
  const f = (familyName || "").trim()
  const m = (model || "").trim()
  if (!f) return undefined
  const composed = m ? `${m}/${f}` : f
  return composed.slice(0, 255)
}

// Squareのidempotency_keyは最大45文字
function generateIdempotencyKey(prefix = "cu"): string {
  const ts = Date.now().toString(36) // 短いタイムスタンプ
  const rand = Math.random().toString(36).slice(2, 10) // 8文字
  const base = `${prefix}-${ts}-${rand}`
  return base.slice(0, 45) // 安全のため断裁
}

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    console.log("受信したフォームデータ:", formData)

    const { familyName, givenName, email, operation } = formData

    // メール送信は顧客検索成功後に行うため、ここでは初期化のみ
    let emailStatus = "❌ 送信失敗"

    const {
      campaignCode,
      phone,
      carModel,
      carColor,
      course,
      newCarModel,
      newCarColor,
      newCourse,
      newEmail,
      inquiryDetails,
      cardToken,
      cancellationReasons,
      cancellationReason,
      reasons,
      procedure,
      procedureType,
      subOperation,
      storeName,
      referenceId: inputReferenceId,
    } = formData

    const toArray = (v: any): string[] => {
      if (!v) return []
      if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim().length > 0)
      if (typeof v === "string" && v.trim().length > 0) return [v.trim()]
      return []
    }

    const reasonsMerged: string[] = [
      ...toArray(cancellationReasons),
      ...toArray(cancellationReason),
      ...toArray(reasons),
    ]

    const procedureVal: string | undefined =
      (typeof procedure === "string" && procedure) ||
      (typeof procedureType === "string" && procedureType) ||
      (typeof subOperation === "string" && subOperation) ||
      undefined

    let squareCustomerId: string | undefined = undefined

    if (
      operation === "クレジットカード情報変更" ||
      operation === "メールアドレス変更" ||
      operation === "登録車両変更"
    ) {
      console.log("Square上で顧客検索を実行中（リファランスID・メール・電話番号の全一致）...")
      try {
        const customersApi = squareClient.customersApi

        // 1. リファランスIDで候補を取得
        let byReferenceId: string[] = []
        if (inputReferenceId) {
          console.log(`[v0] リファランスID検索: 入力値="${inputReferenceId}"`)
          const { result: refResult } = await customersApi.searchCustomers({
            query: { filter: { referenceId: { exact: inputReferenceId } } },
          })
          byReferenceId = (refResult.customers || []).map((c) => c.id as string)
          console.log(`[v0] リファランスID検索結果: ${byReferenceId.length}件`)
          if (refResult.customers) {
            console.log(
              `[v0] 検索結果の顧客ReferenceID:`,
              refResult.customers.map((c) => ({ id: c.id, refId: c.referenceId }))
            )
          }
        }

        // 2. メールアドレスで候補を取得
        let byEmail: string[] = []
        if (email) {
          const { result: emailResult } = await customersApi.searchCustomers({
            query: { filter: { emailAddress: { exact: email } } },
          })
          byEmail = (emailResult.customers || []).map((c) => c.id as string)
        }

        // 3. 電話番号で候補を取得（E164形式に変換）
        let byPhone: string[] = []
        const phoneE164 = toE164Japan(phone)
        if (phoneE164) {
          const { result: phoneResult } = await customersApi.searchCustomers({
            query: { filter: { phoneNumber: { exact: phoneE164 } } },
          })
          byPhone = (phoneResult.customers || []).map((c) => c.id as string)
        }

        // 一致しない項目を特定
        const unmatchedFields: string[] = []
        if (inputReferenceId && byReferenceId.length === 0) unmatchedFields.push("会員番号（リファランスID）")
        if (email && byEmail.length === 0) unmatchedFields.push("メールアドレス")
        if (phoneE164 && byPhone.length === 0) unmatchedFields.push("電話番号")

        if (unmatchedFields.length > 0) {
          console.log("一致しない項目:", unmatchedFields.join("、"))
          return NextResponse.json(
            {
              error: "顧客情報が一致しませんでした",
              unmatchedFields,
              message: `以下の項目が登録情報と一致しませんでした：${unmatchedFields.join("、")}。入力内容をご確認ください。`,
            },
            { status: 404 }
          )
        }

        // 全て一致する顧客IDの絞り込み
        let matchedId: string | null = null
        if (inputReferenceId && email && phone) {
          const intersection = byReferenceId.filter((id) => byEmail.includes(id) && byPhone.includes(id))
          matchedId = intersection.length >= 1 ? intersection[0] : null
        } else if (inputReferenceId && email) {
          const intersection = byReferenceId.filter((id) => byEmail.includes(id))
          matchedId = intersection.length >= 1 ? intersection[0] : null
        } else if (inputReferenceId && phone) {
          const intersection = byReferenceId.filter((id) => byPhone.includes(id))
          matchedId = intersection.length >= 1 ? intersection[0] : null
        } else if (email && phone) {
          const intersection = byEmail.filter((id) => byPhone.includes(id))
          matchedId = intersection.length >= 1 ? intersection[0] : null
        } else if (inputReferenceId) {
          matchedId = byReferenceId.length >= 1 ? byReferenceId[0] : null
        } else if (email) {
          matchedId = byEmail.length >= 1 ? byEmail[0] : null
        } else if (phone) {
          matchedId = byPhone.length >= 1 ? byPhone[0] : null
        }

        if (!matchedId) {
          return NextResponse.json(
            {
              error: "顧客情報が一致しませんでした",
              unmatchedFields: ["会員番号（リファランスID）", "メールアドレス", "電話番号"],
              message: "入力された情報が全て一致する顧客が見つかりませんでした。入力内容をご確認ください。",
            },
            { status: 404 }
          )
        }

        squareCustomerId = matchedId
        console.log("Square上で顧客が見つかりました（全一致）:", squareCustomerId)
      } catch (squareSearchError) {
        console.error("Square顧客検索エラー:", squareSearchError)
        return NextResponse.json(
          { error: "顧客検索中にエラーが発生しました" },
          { status: 500 }
        )
      }
    }

    // 顧客検索成功後にメール送信
    try {
      console.log("確認メール送信を開始します...")
      const emailDetails: any = {}
      if (operation === "各種手続き") {
        if (formData.inquiryType) emailDetails.inquiryType = formData.inquiryType
        if (formData.inquiryDetails) emailDetails.inquiryDetails = formData.inquiryDetails
        if (formData.withdrawalReason) emailDetails.withdrawalReason = formData.withdrawalReason
      }
      await sendInquiryConfirmationEmail(
        `${familyName} ${givenName}`,
        email,
        operation,
        formData.store || "",
        emailDetails,
      )
      emailStatus = "✅ 送信完了"
      console.log("✅ 問い合わせ確認メールを送信しました")
    } catch (emailError) {
      console.error("❌ メール送信中にエラーが発生しました:", emailError)
      emailStatus = `❌ 送信失敗: ${emailError instanceof Error ? emailError.message : "不明なエラー"}`
    }

    if (squareCustomerId) {
      console.log(`Square顧客更新を開始します (操作: ${operation}, 顧客ID: ${squareCustomerId})`)

      const customersApi = squareClient.customersApi

      // 既存顧客情報を取得して車両情報を保持する
      let existingFamilyName: string | undefined
      let existingCompanyName: string | undefined
      try {
        const { result: existingResult } = await customersApi.retrieveCustomer(squareCustomerId)
        existingFamilyName = existingResult.customer?.familyName ?? undefined
        existingCompanyName = existingResult.customer?.companyName ?? undefined
      } catch (e) {
        console.warn("既存顧客情報の取得に失敗:", e)
      }

      // 既存の familyName から名前部分を抽出する関数
      const extractNameFromFamilyName = (familyNameStr: string | undefined): string => {
        if (!familyNameStr) return ""
        // familyName の形式: "リファランスID名前" または "車種/リファランスID名前"
        // 最後のスラッシュ以降が名前部分と想定
        const lastSlashIndex = familyNameStr.lastIndexOf("/")
        if (lastSlashIndex !== -1) {
          return familyNameStr.substring(lastSlashIndex + 1) // スラッシュ以降が名前
        }
        // スラッシュがない場合、最初の英数字とハイフン以降が名前と想定（リファランスIDが先頭）
        const match = familyNameStr.match(/[a-zA-Z0-9\-]+(.*)/)
        return match ? match[1] : familyNameStr
      }

      let companyNameCandidate: string | undefined
      let familyNameForSquare: string | undefined

      if (operation === "登録車両変更") {
        // 新車両情報で更新
        companyNameCandidate = buildCompanyName(newCarModel, newCarColor)
        familyNameForSquare = buildFamilyNameWithModel(familyName, newCarModel)
        console.log(`登録車両変更: 新車種=${newCarModel}, 新色=${newCarColor}`)
      } else if (carModel && carColor) {
        // 車両情報が入力されている場合は更新
        familyNameForSquare = buildFamilyNameWithModel(familyName, carModel)
        companyNameCandidate = buildCompanyName(carModel, carColor)
      } else {
        // 車両情報の入力がない場合（クレジットカード情報変更・メールアドレス変更・洗車コース変更）
        // 既存の familyName から名前部分を抽出して保持する
        const extractedName = extractNameFromFamilyName(existingFamilyName)
        familyNameForSquare = extractedName ? `${inputReferenceId}${extractedName}` : existingFamilyName
        companyNameCandidate = existingCompanyName
        console.log(`${operation}: 車両情報なし。名前を保持 familyName=${familyNameForSquare}, companyName=${companyNameCandidate}`)
      }

      const updatePayload: any = {
        givenName,
        familyName: familyNameForSquare ?? familyName,
        emailAddress: operation === "メールアドレス変更" ? newEmail || email : email,
        phoneNumber: phone,
        note: storeName,
      }
      if (companyNameCandidate) {
        updatePayload.companyName = companyNameCandidate
      }

      try {
        console.log("Square.updateCustomer payload:", updatePayload)
        await customersApi.updateCustomer(squareCustomerId, updatePayload)
        console.log("✅ Square顧客情報が正常に更新されました")
      } catch (updateError) {
        console.error("❌ Square顧客更新エラー:", updateError)
      }
    } else if (operation === "登録車両変更") {
      console.log("⚠️ 登録車両変更: Square上で顧客が見つからなかったため、Square更新をスキップします")
    }

    let cardUpdateSummary: { last4?: string; brand?: string; newCardId?: string } | null = null
    if (operation === "クレジットカード情報変更" && squareCustomerId) {
      if (!cardToken) {
        return NextResponse.json(
          {
            success: false,
            error: "カード情報が無効です。再度カード情報を入力してください。",
          },
          { status: 400 },
        )
      }

      try {
        const idempotencyKey = generateIdempotencyKey("cardupd")
        console.log("Square: クレジットカード更新 idempotency_key:", idempotencyKey)

        const cardsApi = squareClient.cardsApi
        const { result: cardResult } = await cardsApi.createCard({
          idempotencyKey,
          sourceId: cardToken,
          card: {
            customerId: squareCustomerId,
          },
        })
        const newCard = cardResult.card
        cardUpdateSummary = {
          last4: newCard?.last4,
          brand: newCard?.cardBrand as string | undefined,
          newCardId: newCard?.id,
        }
        console.log("Square: 新カード作成完了", cardUpdateSummary)

        // 既存カードを無効化
        try {
          const { result: listRes } = await cardsApi.listCards(undefined, undefined, false, squareCustomerId)
          const existing = listRes.cards || []
          for (const c of existing) {
            if (c.id && c.id !== newCard?.id) {
              try {
                await cardsApi.disableCard(c.id)
                console.log("Square: 旧カードを無効化:", c.id)
              } catch (e) {
                console.warn("Square: 旧カードの無効化呼び出しで警告（続行）:", e)
              }
            }
          }
        } catch (disableErr) {
          console.warn("Square: 旧カードの無効化に失敗（続行）:", disableErr)
        }
      } catch (cardError) {
        console.error("Square: カード作成エラー:", cardError)
        if (cardError instanceof ApiError) {
          const errorDetails = cardError.errors?.[0]
          if (errorDetails?.code === "INVALID_CARD_DATA") {
            return NextResponse.json(
              {
                success: false,
                error: "カード情報が無効です。カード番号、有効期限、セキュリティコードを確認してください。",
              },
              { status: 400 },
            )
          }
        }
        return NextResponse.json(
          {
            success: false,
            error: "カード情報の更新中にエラーが発生しました。",
          },
          { status: 500 },
        )
      }
    }

    let googleSheetsStatus = "❌ 記録失敗"
    try {
      console.log("Google Sheetsにデータを追加中...")

      let qColumnData = ""
      if (operation === "各種手続き" && procedure) {
        qColumnData = `【${procedure}】`
        if (reasonsMerged.length > 0) {
          qColumnData += ` 解約理由: ${reasonsMerged.join(", ")}`
        }
        if (inquiryDetails && inquiryDetails.trim()) {
          qColumnData += reasonsMerged.length > 0 ? `, ${inquiryDetails}` : ` ${inquiryDetails}`
        }
      } else if (operation === "解約") {
        qColumnData = "【解約】"
        if (reasonsMerged.length > 0) {
          qColumnData += ` 解約理由: ${reasonsMerged.join(", ")}`
        }
        if (inquiryDetails && inquiryDetails.trim()) {
          qColumnData += reasonsMerged.length > 0 ? `, ${inquiryDetails}` : ` ${inquiryDetails}`
        }
      } else if (operation === "その他問い合わせ") {
        qColumnData = "【その他問い合わせ】"
        if (reasonsMerged.length > 0) {
          qColumnData += ` 内容: ${reasonsMerged.join(", ")}`
        }
        if (inquiryDetails && inquiryDetails.trim()) {
          qColumnData += reasonsMerged.length > 0 ? `, ${inquiryDetails}` : ` ${inquiryDetails}`
        }
      } else {
        qColumnData = inquiryDetails || ""
      }

      const sheetData = [
        formatJapanDateTime(new Date()), // A: タイムスタンプ（JST表記）
        operation, // B: 操作
        inputReferenceId || "", // C: リファレンスID
        storeName, // D: 店舗
        `${familyName} ${givenName}`, // E: 名前
        email, // F: メールアドレス
        newEmail || "", // G: 新しいメールアドレス
        phone, // H: 電話番号
        carModel || "", // I: 車種
        carColor || "", // J: 車の色
        "", // K: ナンバー（削除済み）
        course || "", // L: 洗車コース名
        newCarModel || "", // M: 新しい車種
        newCarColor || "", // N: 新しい車の色
        "", // O: 新しいナンバー（削除済み）
        newCourse || "", // P: 新しいコース
        qColumnData, // Q: お問い合わせの種類と解約理由を組み合わせた形式
        "", // R: 空白
        "", // S: 空白
        campaignCode || "", // T: キャンペーンコード
      ]
      await appendToSheet([sheetData])
      googleSheetsStatus = "✅ 記録完了"
      console.log("Google Sheetsにデータが正常に追加されました")
    } catch (sheetError) {
      console.error("Google Sheets書き込みエラー:", sheetError)
      googleSheetsStatus = `❌ 記録失敗: ${sheetError instanceof Error ? sheetError.message : "不明なエラー"}`
    }

    return NextResponse.json({
      success: true,
      message: "処理が完了しました",
      customerId: null, // CloudSQL削除により常にnull
      referenceId: "", // CloudSQL削除により空文字
      dataStorage: {
        googleSheets: googleSheetsStatus,
        email: emailStatus,
        square:
          operation === "クレジットカード情報変更"
            ? "✅ カード更新済"
            : operation === "メールアドレス変更"
              ? "✅ メールアドレス更新済"
              : operation === "登録車両変更"
                ? squareCustomerId
                  ? "✅ 車両情報更新済"
                  : "⚠️ Square顧客未発見"
                : "—",
      },
    })
  } catch (error) {
    console.error("顧客更新エラー:", error)
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: "Square APIエラー", details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "不明なエラーが発生しました" },
      { status: 500 },
    )
  }
}
