import React, { useEffect, useMemo, useState } from "react"
import { X, Calendar, MapPin, Package, User, Phone, Mail } from "lucide-react"
import { formatMoney } from "../../utils/format"

import { getRobotTypesOfActivityAsync } from "../../apis/robottypeofactivity.api"
import type { RobotAbility } from "../../components/robot-config/AbilityField"

type RentalInfo = any

// ✅ NEW response
type RentalChangeLog = {
  id: number
  rentalId: number
  fieldName: string
  oldValue: string | null
  newValue: string | null
  changedAtUtc: string
  changedByAccountId: number
}

type UpdatedAbilityValue = {
  id: number
  rentalDetailId: number
  robotAbilityId: number
  valueText: string | null
  valueJson: string | null
  updatedAt: string
  isUpdated: boolean
}

type UpdateApiResponseData = {
  rentalIsUpdated: boolean
  rentalDetailIsUpdated: boolean
  rentalChangeLogResponses: RentalChangeLog[]
  robotAbilityValueResponses: UpdatedAbilityValue[]
}

// Your existing detail (tabs)
type RentalDetail = {
  id: number
  status: string
  rentalId: number
  roboTypeId: number
  robotTypeName: string
  robotTypeDescription: string
}

const safeJsonParse = (text?: string | null) => {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const prettyAny = (v: any) => {
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

// same parse logic as CreateRentalDetailContent (but simplified)
const parseValueForDisplay = (ability: RobotAbility | undefined, av: UpdatedAbilityValue) => {
  const dt = (ability?.dataType || "").toLowerCase()
  const ui = (ability?.uiControl || "").toLowerCase()

  // valueJson first
  if (av.valueJson != null && av.valueJson !== "") {
    const parsed = safeJsonParse(av.valueJson)

    if (dt === "enum[]" || ui === "multiselect") return Array.isArray(parsed) ? parsed : []
    if (dt === "json" || ui === "jsoneditor") return parsed ?? null

    return parsed ?? av.valueJson
  }

  // valueText
  if (av.valueText == null) return null

  if (dt === "bool" || ui === "switch") {
    const t = av.valueText.trim().toLowerCase()
    return t === "true" || t === "1" || t === "yes"
  }

  if (dt === "number" || dt === "int" || dt === "integer") {
    const n = Number(av.valueText)
    return Number.isFinite(n) ? n : av.valueText
  }

  return av.valueText
}

function UpdatedBadge() {
  return (
    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
      UPDATED
    </span>
  )
}

export default function RentalDetailModal({
  isOpen,
  onClose,
  rentalInfo,
  rentalDetails,
  updateData, // ✅ NEW: pass data.data from your JSON
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  rentalInfo: RentalInfo | null
  rentalDetails: RentalDetail[]
  updateData?: UpdateApiResponseData | null
  isLoading?: boolean
}) {
  const [activeTab, setActiveTab] = useState(0)

  // schema abilities
  const [abilitiesByType, setAbilitiesByType] = useState<Record<number, RobotAbility[]>>({})
  const [schemaLoading, setSchemaLoading] = useState(false)

  const tabs = useMemo(() => rentalDetails || [], [rentalDetails])
  const active = tabs[activeTab]

  useEffect(() => {
    if (activeTab >= tabs.length) setActiveTab(0)
  }, [tabs.length, activeTab])

  // ✅ load schema by activityTypeId
  useEffect(() => {
    const activityTypeId =
      rentalInfo?.activityTypeId ??
      rentalInfo?.activityTypeResponse?.id ??
      rentalInfo?.activityType?.id

    if (!isOpen || !activityTypeId) return

    let mounted = true
    ;(async () => {
      try {
        setSchemaLoading(true)
        const mapping = await getRobotTypesOfActivityAsync(Number(activityTypeId))
        const dict: Record<number, RobotAbility[]> = {}
        ;(mapping || []).forEach((m: any) => {
          dict[m.roboTypeId] = (m.robotAbilityResponses || []) as RobotAbility[]
        })
        if (mounted) setAbilitiesByType(dict)
      } catch (e) {
        console.warn("Failed to load robot ability schema:", e)
        if (mounted) setAbilitiesByType({})
      } finally {
        if (mounted) setSchemaLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [isOpen, rentalInfo?.activityTypeId])

  // ✅ map abilityId -> ability (for active tab only)
  const abilityById = useMemo(() => {
    const map = new Map<number, RobotAbility>()
    if (!active) return map
    const list = abilitiesByType[active.roboTypeId] || []
    list.forEach((a) => map.set(a.id, a))
    return map
  }, [active, abilitiesByType])

  // ✅ Filter updated ability values for active rentalDetailId
  const updatedValuesForActive = useMemo(() => {
    if (!active || !updateData?.robotAbilityValueResponses) return []
    return updateData.robotAbilityValueResponses
      .filter((x) => Number(x.rentalDetailId) === Number(active.id))
      // optional sort by updatedAt desc
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [active, updateData])

  // ✅ Rental field changelog
  const rentalFieldLogs = useMemo(() => {
    return (updateData?.rentalChangeLogResponses || []).slice().sort((a, b) => {
      return a.changedAtUtc < b.changedAtUtc ? 1 : -1
    })
  }, [updateData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Rental Details</h2>
              <p className="text-xs text-gray-500">
                {rentalInfo?.eventName ? `Event: ${rentalInfo.eventName}` : "—"}
                {rentalInfo?.id ? ` • Rental #${rentalInfo.id}` : ""}

                {updateData?.rentalIsUpdated ? (
                  <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Rental UPDATED
                  </span>
                ) : null}

                {updateData?.rentalDetailIsUpdated ? (
                  <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Details UPDATED
                  </span>
                ) : null}
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
              {/* LEFT */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                {/* Rental Information */}
                <div className="border border-gray-200 rounded-2xl p-5 bg-white">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Rental Information</h3>

                  {isLoading && !rentalInfo ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : (
                    <div className="space-y-4">
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

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{rentalInfo?.address || "—"}</p>
                          <p className="text-xs text-gray-600">{rentalInfo?.city || ""}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rentalInfo?.activityTypeName || rentalInfo?.eventActivityName || "—"}
                          </p>
                          <p className="text-xs text-gray-600">{rentalInfo?.status || ""}</p>

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

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rentalInfo?.customerName || "—"}
                          </p>
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

                      {schemaLoading ? (
                        <div className="text-xs text-gray-500">Loading robot ability schema...</div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* ✅ Rental Change Logs */}
                <div className="border border-gray-200 rounded-2xl p-5 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Rental Change Logs</h3>
                    {rentalFieldLogs.length > 0 ? <UpdatedBadge /> : null}
                  </div>

                  {rentalFieldLogs.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-3">No rental field changes.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {rentalFieldLogs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-xl border border-blue-200 bg-blue-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-semibold text-gray-900">
                              {log.fieldName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.changedAtUtc).toLocaleString()}
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-700 space-y-1">
                            <div>
                              <span className="font-semibold">Old:</span>{" "}
                              <span className="text-gray-600">{log.oldValue ?? "—"}</span>
                            </div>
                            <div>
                              <span className="font-semibold">New:</span>{" "}
                              <span className="text-gray-900">{log.newValue ?? "—"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="col-span-12 lg:col-span-8">
                <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
                  <div className="px-5 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900">Robot Configuration</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Showing ONLY updated abilities from API:{" "}
                      <code className="px-1 py-0.5 bg-gray-100 rounded">
                        data.robotAbilityValueResponses
                      </code>
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
                          <h4 className="text-base font-bold text-gray-900">{active.robotTypeName}</h4>
                          <p className="text-sm text-gray-600 mt-1">{active.robotTypeDescription}</p>
                        </div>

                        {/* ✅ Updated ability list for this RentalDetailId */}
                        {updatedValuesForActive.length === 0 ? (
                          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                            No updated abilities for this robot.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {updatedValuesForActive.map((v) => {
                              const ability = abilityById.get(v.robotAbilityId)
                              const displayValue = parseValueForDisplay(ability, v)
                              const isJson =
                                (ability?.dataType || "").toLowerCase() === "json" ||
                                (ability?.uiControl || "").toLowerCase() === "jsoneditor" ||
                                Array.isArray(displayValue) ||
                                (typeof displayValue === "object" && displayValue !== null)

                              const title = ability?.label
                                ? ability.label
                                : `Ability #${v.robotAbilityId}`

                              const subtitle = ability?.key ? `${ability.key}` : ""

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
                                        {title}
                                        {v.isUpdated ? <UpdatedBadge /> : null}
                                      </p>

                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {subtitle ? (
                                          <>
                                            <span className="font-semibold text-gray-700">{subtitle}</span>
                                            {" • "}
                                          </>
                                        ) : null}
                                        UpdatedAt: {new Date(v.updatedAt).toLocaleString()}
                                        {ability?.abilityGroup ? ` • Group: ${ability.abilityGroup}` : ""}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    {displayValue === null || displayValue === "" ? (
                                      <p className="text-sm text-gray-400 italic">No value</p>
                                    ) : isJson ? (
                                      <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
                                        {prettyAny(displayValue)}
                                      </pre>
                                    ) : (
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {String(displayValue)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

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
