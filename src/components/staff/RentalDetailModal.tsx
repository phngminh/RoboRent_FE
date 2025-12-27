import React, { useMemo, useState } from "react"
import { X, Calendar, MapPin, Package, User, Phone, Mail } from "lucide-react"
import { formatMoney } from "../../utils/format"

type RentalInfo = any

type RentalDetailValue = {
  id: number
  rentalDetailId: number
  robotAbilityId: number
  valueText: string | null
  valueJson: string | null
  updatedAt: string
  isUpdated: boolean
}

type RentalDetail = {
  id: number
  status: string
  rentalId: number
  roboTypeId: number
  robotTypeName: string
  robotTypeDescription: string
  robotAbilityValueResponses: RentalDetailValue[]
}

function safePrettyJson(text: string | null) {
  if (!text) return null
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

export default function RentalDetailModal({
  isOpen,
  onClose,
  rentalInfo,
  rentalDetails,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  rentalInfo: RentalInfo | null
  rentalDetails: RentalDetail[]
  isLoading?: boolean
}) {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = useMemo(() => rentalDetails || [], [rentalDetails])

  const active = tabs[activeTab]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Rental Details
              </h2>
              <p className="text-xs text-gray-500">
                {rentalInfo?.eventName ? `Event: ${rentalInfo.eventName}` : "—"}
                {rentalInfo?.id ? ` • Rental #${rentalInfo.id}` : ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[78vh] overflow-y-auto">
            <div className="p-6 grid grid-cols-12 gap-6">
              {/* LEFT: Rental Information (like image #3) */}
              <div className="col-span-12 lg:col-span-4">
                <div className="border border-gray-200 rounded-2xl p-5 bg-white">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Rental Information
                  </h3>

                  {isLoading && !rentalInfo ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Date + time */}
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rentalInfo?.eventDate
                              ? new Date(rentalInfo.eventDate).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {rentalInfo?.startTime?.substring(0, 5) || "--:--"} –{" "}
                            {rentalInfo?.endTime?.substring(0, 5) || "--:--"}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{rentalInfo?.address || "—"}</p>
                          <p className="text-xs text-gray-600">{rentalInfo?.city || ""}</p>
                        </div>
                      </div>

                      {/* Package */}
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rentalInfo?.activityTypeName || rentalInfo?.eventActivityName || "—"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {rentalInfo?.activityTypeResponse?.code
                              ? `${rentalInfo.activityTypeResponse.code} • `
                              : ""}
                            {rentalInfo?.status || ""}
                          </p>
                          {typeof rentalInfo?.activityTypeResponse?.price === "number" && (
                            <p className="text-xs text-gray-700 mt-1">
                              Package price:{" "}
                              <span className="font-semibold">
                                {formatMoney(rentalInfo.activityTypeResponse.price)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rentalInfo?.customerName || "—"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="text-xs text-gray-600">{rentalInfo?.phoneNumber || "—"}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <p className="text-xs text-gray-600">{rentalInfo?.email || "—"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Robot Configuration (tabs like image #3) */}
              <div className="col-span-12 lg:col-span-8">
                <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
                  <div className="px-5 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Robot Configuration
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Shows values from <code className="px-1 py-0.5 bg-gray-100 rounded">getRentalDetailsByRentalIdAsync</code>
                    </p>

                    {/* Tabs */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tabs.map((t, idx) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(idx)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            idx === activeTab
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {t.robotTypeName}
                        </button>
                      ))}
                      {tabs.length === 0 && (
                        <span className="text-sm text-gray-500">No robot details.</span>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-4 border-t border-gray-200">
                    {isLoading && tabs.length === 0 ? (
                      <p className="text-sm text-gray-500">Loading robot details...</p>
                    ) : !active ? (
                      <p className="text-sm text-gray-500">No data.</p>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <h4 className="text-base font-bold text-gray-900">
                            {active.robotTypeName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {active.robotTypeDescription}
                          </p>
                        </div>

                        {/* Values list */}
                        <div className="space-y-2">
                          {active.robotAbilityValueResponses.map((v) => {
                            const prettyJson = safePrettyJson(v.valueJson)
                            const display =
                              v.valueText !== null
                                ? v.valueText
                                : prettyJson !== null
                                  ? prettyJson
                                  : ""

                            const isEmpty =
                              v.valueText === null && (v.valueJson === null || v.valueJson === "[]")

                            return (
                              <div
                                key={v.id}
                                className={`rounded-xl border p-3 ${
                                  v.isUpdated
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      Ability #{v.robotAbilityId}
                                      {v.isUpdated && (
                                        <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                                          UPDATED
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      UpdatedAt: {new Date(v.updatedAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-2">
                                  {isEmpty ? (
                                    <p className="text-sm text-gray-400 italic">No value</p>
                                  ) : prettyJson ? (
                                    <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
                                      {display}
                                    </pre>
                                  ) : (
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                      {display}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer buttons (optional) */}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* End body */}
        </div>
      </div>
    </div>
  )
}
