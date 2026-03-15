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

function toArray(v: unknown): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim().length > 0)
  if (typeof v === "string" && v.trim().length > 0) return [v.trim()]
  return []
}

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    console.log("受信したフォームデータ:", formData)

    // 変更系操作はupdate-customerで既に処理済みのため、submit-inquiryでは処理しない
    const ALREADY_PROCESSED_OPERATIONS = ["登録車両変更", "洗車コース変更", "クレジットカード情報変更", "メールアドレス変更"]
    if (ALREADY_PROCESSED_OPERATIONS.includes(formData.operation)) {
      console.log(`${formData.operation}はupdate-customerで処理済みのため、submit-inquiryはスキップします`)
      return NextResponse.json({ success: true, skipped: true })
    }

    const {
      operation,
      store,
      familyName,
      givenName,
      email,
      phone,
      carModel,
      carColor,
      course,
      newCarModel,
      newCarColor,
      newCourse,
      newEmail,
      inquiryDetails,
      campaignCode,
      cardToken,
      cancellationReasons,
      cancellationReason,
      reasons,
      procedure,
      procedureType,
      subOperation,
      inquiryType,
      referenceId: inputReferenceId,
    } = formData

    const reasonsMerged: string[] = [
      ...toArray(cancellationReasons),
      ...toArray(cancellationReason),
      ...toArray(reasons),
    ]

    const procedureVal: string | undefined =
      (typeof procedure === "string" && procedure) ||
      (typeof procedureType === "string" && procedureType) ||
      (typeof subOperation === "string" && subOperation) ||
      (typeof inquiryType === "string" && inquiryType) ||
      undefined

    let squareCustomerId: string | undefined = undefined
    let referenceId = `inquiry_${Date.now()}`

    if (
      operation === "メールアドレス変更" ||
      operation === "クレジットカード情報変更" ||
      operation === "登録車両変更" ||
      operation === "洗車コース変更"
    ) {
      console.log("Square上で顧客検索を実行中（リファランスID・メール・電話番号の全一致）...")
      try {
        const customersApi = squareClient.customersApi

        // 1. リファランスIDで候補を取得
        let byReferenceId: string[] = []
        if (inputReferenceId) {
          const { result: refResult } = await customersApi.searchCustomers({
            query: { filter: { referenceId: { exact: inputReferenceId } } },
          })
          byReferenceId = (refResult.customers || []).map((c) => c.id as string)
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

        // 各検索値の一致状況を確認
        const refIdMatched = !inputReferenceId || byReferenceId.length > 0
        const emailMatched = !email || byEmail.length > 0
        const phoneMatched = !phoneE164 || byPhone.length > 0

        // 一致しない項目を特定してエラーメッセージを生成
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
          const intersection = byReferenceId.filter(
            (id) => byEmail.includes(id) && byPhone.includes(id)
          )
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
          console.log("全検索値に一致する顧客が見つかりませんでした")
          return NextResponse.json(
            {
              error: "顧客情報が一致しませんでした",
              unmatchedFields: ["会員番号（リファランスID）", "メールアドレス", "電話番号"],
              message: "入力された情報が全て一致する顧客が見つかりませんでした。入力内容をご確認ください。",
            },
            { status: 404 }
          )
        }

        const { result: matchedCustomer } = await customersApi.retrieveCustomer(matchedId)
        const foundCustomer = matchedCustomer.customer
        if (foundCustomer) {
          squareCustomerId = foundCustomer.id
          referenceId = foundCustomer.referenceId || referenceId
          console.log("Square上で顧客が見つかりました（全一致）:", squareCustomerId)

          const { result: existingCustomer } = await customersApi.retrieveCustomer(squareCustomerId as string)

          let companyNameCandidate: string | undefined
          let familyNameForSquare: string | undefined

          if (operation === "登録車両変更") {
            companyNameCandidate =
              buildCompanyName(newCarModel, newCarColor) || existingCustomer.customer?.companyName || undefined
            familyNameForSquare = buildFamilyNameWithModel(familyName, newCarModel) || familyName
          } else {
            familyNameForSquare = buildFamilyNameWithModel(familyName, carModel) || familyName
            companyNameCandidate =
              buildCompanyName(carModel, carColor) || existingCustomer.customer?.companyName || undefined
          }

          const updatePayload: any = {
            givenName: givenName || existingCustomer.customer?.givenName,
            familyName: familyNameForSquare ?? familyName ?? existingCustomer.customer?.familyName,
            emailAddress:
              operation === "メールアドレス変更"
                ? newEmail || email
                : email || existingCustomer.customer?.emailAddress,
            phoneNumber: phone || existingCustomer.customer?.phoneNumber,
            note: store || existingCustomer.customer?.note,
          }

          if (operation === "登録車両変更" && companyNameCandidate) {
            updatePayload.companyName = companyNameCandidate
          } else if (existingCustomer.customer?.companyName) {
            updatePayload.companyName = existingCustomer.customer.companyName
          }

          console.log("Square.updateCustomer payload:", updatePayload)
          await customersApi.updateCustomer(squareCustomerId as string, updatePayload)
          console.log("Square顧客情報が正常に更新されました")
        } else {
          return NextResponse.json(
            {
              error: "顧客情報が取得できませんでした",
              message: "顧客情報の取得中にエラーが発生しました。",
            },
            { status: 404 }
          )
        }
      } catch (squareSearchError) {
        console.error("Square顧客検索エラー:", squareSearchError)
        return NextResponse.json(
          { error: "顧客検索中にエラーが発生しました" },
          { status: 500 }
        )
      }
    }

    if (operation === "クレジットカード情報変更" && squareCustomerId && cardToken) {
      // カード処理はupdate-customerで実施済みのためここでは行わない
    }

    // 確認メール送信
    let emailStatus = "❌ 送信失敗"
    try {
      console.log("確認メール送信中...")
      if (operation === "各種手続き") {
        await sendInquiryConfirmationEmail(`${familyName} ${givenName}`, email, operation, store, {
          inquiryType: procedureVal,
          inquiryDetails: inquiryDetails,
          withdrawalReason: reasonsMerged,
        })
      } else {
        await sendInquiryConfirmationEmail(`${familyName} ${givenName}`, email, operation, store)
      }
      emailStatus = "✅ 送信完了"
      console.log("問い合わせ確認メールを送信しました")
    } catch (emailError) {
      console.error("メール送信中にエラーが発生しました:", emailError)
      emailStatus = `❌ 送信失敗: ${emailError instanceof Error ? emailError.message : "不明なエラー"}`
    }

    // Google Sheets書き込み
    let googleSheetsStatus = "❌ 記録失敗"
    try {
      console.log("Google Sheetsにデータを追加中...")

      let qColumnData = ""
      if (operation === "各種手続き" && procedureVal) {
        qColumnData = `【${procedureVal}】`
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
        formatJapanDateTime(new Date()),
        operation || "",
        inputReferenceId || referenceId || "", // C: お客様入力のリファランスID優先
        store || "",
        `${familyName || ""} ${givenName || ""}`.trim(),
        email || "",
        newEmail || "",
        phone || "",
        carModel || "",
        carColor || "",
        "",
        course || "",
        newCarModel || "",
        newCarColor || "",
        "",
        newCourse || "",
        qColumnData,
        "",
        "",
        campaignCode || "",
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
      referenceId: referenceId,
      dataStorage: {
        email: emailStatus,
        googleSheets: googleSheetsStatus,
        square: squareCustomerId ? "✅ 顧客情報更新済" : "— 顧客未検索",
      },
    })
  } catch (error) {
    console.error("submit-inquiry エラー:", error)
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: "Square APIエラー", details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "不明なエラーが発生しました" },
      { status: 500 },
    )
  }
}
