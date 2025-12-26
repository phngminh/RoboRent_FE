import {
  Clock,
  Phone,
  Mail,
  User,
  Hash,
  Calendar,
  PenSquare,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import { getRentalByIdAsync, staffRequestUpdateRentalAsync } from "../../apis/rental.staff.api";
import { getRentalDetailsByRentalIdAsync } from "../../apis/rentaldetail.api";
import { getGroupScheduleByRentalIdForCustomerAsync } from "../../apis/groupSchedule.customer.api";
import { useAuth } from "../../contexts/AuthContext";

// ✅ fetch schema abilities by activity type
import { getRobotTypesOfActivityAsync } from "../../apis/robottypeofactivity.api";

// ✅ reuse same form component (read-only)
import { RobotAbilityCardForm } from "../../components/robot-config/RobotAbilityCardForm";
import type { RobotAbility } from "../../components/robot-config/AbilityField";

interface ShareRentalRequestDetailProps {
  onBack: () => void;
  onNavigateToScheduleBoard?: (groupId: number) => void;
}

type AbilityValueResponse = {
  id: number;
  rentalDetailId: number;
  robotAbilityId: number;
  valueText: string | null;
  valueJson: string | null;
  updatedAt?: string;
  isUpdated?: boolean;
};

type AbilityValueMap = Record<string, any>;

export default function ShareRentalRequestDetail({
  onBack,
  onNavigateToScheduleBoard,
}: ShareRentalRequestDetailProps) {
  const { user } = useAuth();
  const userRole = user?.role;

  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>();
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0;

  const [rental, setRental] = useState<any>(null);
  const [rentalDetails, setRentalDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const detailRef = useRef<HTMLDivElement | null>(null);

  // Grouping state
  const [grouped, setGrouped] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // schema abilities for each roboTypeId
  const [abilitiesByType, setAbilitiesByType] = useState<Record<number, RobotAbility[]>>({});

  const [schedule, setSchedule] = useState<any | null>(null);
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "schedule">("details");

  // ---------------- helpers ----------------
  const formatMoney = (v: any, currency = "VND") => {
    const n = Number(v);
    if (!Number.isFinite(n)) return v ?? "";
    try {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(n);
    } catch {
      return `${n.toLocaleString("vi-VN")} ${currency}`;
    }
  };

  const formatMinutes = (m: any) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return m ?? "";
    const hours = Math.floor(n / 60);
    const mins = n % 60;
    if (hours <= 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };

  // ---- config value helpers ----
  const safeJsonParse = (text?: string | null) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const parseStoredAbilityValue = (ability: RobotAbility, av?: AbilityValueResponse) => {
    if (!av) return undefined;

    const dt = (ability.dataType || "").toLowerCase();
    const ui = (ability.uiControl || "").toLowerCase();

    if (av.valueJson != null && av.valueJson !== "") {
      if (dt === "enum[]" || ui === "multiselect") {
        const parsed = safeJsonParse(av.valueJson);
        return Array.isArray(parsed) ? parsed : [];
      }

      if (dt === "json" || ui === "jsoneditor") {
        const parsed = safeJsonParse(av.valueJson);
        return parsed != null ? JSON.stringify(parsed, null, 2) : av.valueJson;
      }

      const parsed = safeJsonParse(av.valueJson);
      return parsed ?? av.valueJson;
    }

    if (av.valueText == null) return null;

    if (dt === "bool" || ui === "switch") {
      const t = av.valueText.trim().toLowerCase();
      return t === "true" || t === "1" || t === "yes";
    }

    if (dt === "number" || dt === "int" || dt === "integer") {
      const n = Number(av.valueText);
      return Number.isFinite(n) ? n : av.valueText;
    }

    return av.valueText;
  };

  const buildConfigValuesFromAbilityResponses = (
    abilities: RobotAbility[],
    responses: AbilityValueResponse[] | null | undefined
  ): AbilityValueMap => {
    const mapById = new Map<number, AbilityValueResponse>();
    (responses || []).forEach((r) => mapById.set(r.robotAbilityId, r));

    const raw: AbilityValueMap = {};
    abilities
      .filter((a) => a.isActive !== false)
      .forEach((a) => {
        const av = mapById.get(a.id);
        const v = parseStoredAbilityValue(a, av);
        if (v !== undefined) raw[a.key] = v;
      });

    return raw;
  };

  const initDefaults = (abilities: RobotAbility[], current?: AbilityValueMap) => {
    const next: AbilityValueMap = { ...(current || {}) };

    abilities
      .filter((a) => a.isActive !== false)
      .forEach((a) => {
        if (next[a.key] !== undefined) return;

        const dt = (a.dataType || "").toLowerCase();
        const ui = (a.uiControl || "").toLowerCase();

        if (dt === "bool" || ui === "switch") next[a.key] = false;
        else if (dt === "enum[]" || ui === "multiselect") next[a.key] = [];
        else next[a.key] = "";
      });

    return next;
  };

  function splitAbilitiesIntoUiSections(abilities: RobotAbility[]) {
    const normalize = (s?: string | null) => (s || "").trim().toLowerCase();

    const branding: RobotAbility[] = [];
    const welcome: RobotAbility[] = [];
    const cta: RobotAbility[] = [];
    const other: RobotAbility[] = [];

    for (const a of abilities) {
      const g = normalize(a.abilityGroup);
      const k = normalize(a.key);
      const l = normalize(a.label);
      const text = `${g} ${k} ${l}`;

      if (g.includes("brand") || g.includes("ui") || text.includes("logo") || text.includes("theme")) {
        branding.push(a);
        continue;
      }
      if (g.includes("welcome") || text.includes("welcome") || text.includes("greeting")) {
        welcome.push(a);
        continue;
      }
      if (g.includes("cta") || g.includes("qr") || text.includes("cta") || text.includes("qr")) {
        cta.push(a);
        continue;
      }

      other.push(a);
    }

    if (branding.length === 0 && welcome.length === 0 && cta.length === 0 && other.length > 0) {
      return { branding: other, welcome: [], cta: [], other: [] };
    }

    return { branding, welcome, cta, other };
  }

  const loadSchedule = async () => {
    try {
      const res = await getGroupScheduleByRentalIdForCustomerAsync(rentalId);
      if (res.success) setSchedule(res.data);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    }
  };

  // =======================
  // FETCH RENTAL & DETAILS + ABILITY SCHEMA
  // =======================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const rentalRes = await getRentalByIdAsync(rentalId);
        const rentalObj = (rentalRes as any)?.data ?? rentalRes;
        setRental(rentalObj);

        if (rentalObj?.activityTypeId) {
          try {
            const mapping = await getRobotTypesOfActivityAsync(rentalObj.activityTypeId);
            const dict: Record<number, RobotAbility[]> = {};
            (mapping || []).forEach((m: any) => {
              dict[m.roboTypeId] = (m.robotAbilityResponses || []) as RobotAbility[];
            });
            setAbilitiesByType(dict);
          } catch (e) {
            console.warn("Failed to load robot ability schema:", e);
            setAbilitiesByType({});
          }
        }

        const detailRes = await getRentalDetailsByRentalIdAsync(rentalId);
        if (detailRes.success) setRentalDetails(detailRes.data);
      } catch (err) {
        console.error("Failed to load rental detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rentalId]);

  // =======================
  // GROUP DETAILS BY ROBOT TYPE
  // =======================
  useEffect(() => {
    if (rentalDetails.length === 0) return;

    const map: Record<number, any[]> = {};

    rentalDetails.forEach((d) => {
      if (!map[d.roboTypeId]) map[d.roboTypeId] = [];
      map[d.roboTypeId].push(d);
    });

    const groups = Object.keys(map).map((id) => ({
      roboTypeId: Number(id),
      robotTypeName: map[Number(id)][0].robotTypeName,
      robotTypeDescription: map[Number(id)][0].robotTypeDescription,
      items: map[Number(id)],
    }));

    setGrouped(groups);

    setActiveType((prev) => prev ?? (groups[0]?.roboTypeId ?? null));
    setPage(0);
  }, [rentalDetails]);

  // =======================
  // ✅ ALL MEMOS ABOVE EARLY RETURNS
  // =======================
  const createdDate = useMemo(
    () => (rental?.createdDate ? new Date(rental.createdDate).toLocaleDateString() : ""),
    [rental?.createdDate]
  );
  const updatedDate = useMemo(
    () => (rental?.updatedDate ? new Date(rental.updatedDate).toLocaleDateString() : ""),
    [rental?.updatedDate]
  );
  const eventDate = useMemo(
    () => (rental?.eventDate ? new Date(rental.eventDate).toLocaleDateString() : ""),
    [rental?.eventDate]
  );

  const activity = useMemo(() => rental?.activityTypeResponse ?? null, [rental]);
  const currency = useMemo(() => activity?.currency ?? "VND", [activity]);

  const currentGroup = useMemo(
    () => grouped.find((g) => g.roboTypeId === activeType) ?? null,
    [grouped, activeType]
  );
  const currentItem = useMemo(
    () => (currentGroup ? currentGroup.items?.[page] ?? null : null),
    [currentGroup, page]
  );

  const currentAbilities = useMemo(() => {
    if (!currentItem) return [];
    return (abilitiesByType[currentItem.roboTypeId] || []).filter((a) => a.isActive !== false);
  }, [currentItem, abilitiesByType]);

  const currentConfigValues = useMemo(() => {
    if (!currentItem) return {};
    const raw = buildConfigValuesFromAbilityResponses(
      currentAbilities,
      (currentItem.robotAbilityValueResponses || []) as AbilityValueResponse[]
    );
    return initDefaults(currentAbilities, raw);
  }, [currentItem, currentAbilities]);

  const currentSections = useMemo(() => splitAbilitiesIntoUiSections(currentAbilities), [currentAbilities]);

  // =======================
  // LOADING / ERROR STATES
  // =======================
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading rental details...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load rental details.</p>
        <button onClick={onBack} className="text-blue-600 underline mt-2">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to Requests
      </button>

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">
        Rental Request: <span className="font-semibold">{rental.eventName}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SECTION */}
        <div className="space-y-6 lg:col-span-1">
          {/* Rental Information */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Rental Information</h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <PenSquare size={16} className="text-blue-600" />
                <span>
                  <strong>Event Name:</strong> {rental.eventName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-600" />
                <span>
                  <strong>Email:</strong> {rental.email}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-600" />
                <span>
                  <strong>Phone:</strong> {rental.phoneNumber}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-600" />
                <span>
                  <strong>Created Date:</strong> {createdDate}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-600" />
                <span>
                  <strong>Updated Date:</strong> {updatedDate}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={16} className="text-yellow-500" />
                <span>
                  <strong>Status:</strong> {rental.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <User size={16} className="text-green-600" />
                <span>
                  <strong>Account ID:</strong> {rental.accountId}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Hash size={16} className="text-green-600" />
                <span>
                  <strong>Event Activity:</strong> {rental.eventActivityName ?? "—"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Hash size={16} className="text-green-600" />
                <span>
                  <strong>Activity Type:</strong> {rental.activityTypeName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-600" />
                <span>
                  <strong>Event Date:</strong> {eventDate}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Type Information */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Activity Type Information</h2>

            {!activity ? (
              <div className="text-sm text-gray-500 italic">No activity type details.</div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-600">Name</span>
                  <span className="font-semibold text-right">{activity.name}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-600">Code</span>
                  <span className="font-semibold">{activity.code}</span>
                </div>

                {activity.shortDescription && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-gray-600 mb-1">Short description</div>
                    <div className="text-gray-800">{activity.shortDescription}</div>
                  </div>
                )}

                {activity.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-gray-600 mb-1">Description</div>
                    <div className="text-gray-800">{activity.description}</div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Package price</span>
                    <span className="font-semibold">{formatMoney(activity.price, currency)}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Hourly rate</span>
                    <span className="font-semibold">{formatMoney(activity.hourlyRate, currency)}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Minimum duration</span>
                    <span className="font-semibold">{formatMinutes(activity.minimumMinutes)}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Billing step</span>
                    <span className="font-semibold">{formatMinutes(activity.billingIncrementMinutes)}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Includes operator</span>
                    <span className="font-semibold">
                      {activity.includesOperator ? `Yes (${activity.operatorCount} người)` : "No"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Technical staff fee / hour</span>
                    <span className="font-semibold">
                      {formatMoney(activity.technicalStaffFeePerHour, currency)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">Active</span>
                    <span className={`font-semibold ${activity.isActive ? "text-green-700" : "text-gray-500"}`}>
                      {activity.isActive ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={() => setViewMode("details")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                View Details
              </button>

              <button
                onClick={async () => {
                  setViewMode("schedule");
                  await loadSchedule();
                  if (scheduleRef.current) scheduleRef.current.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
              >
                View Schedules
              </button>

              {userRole === "staff" && rental.status === "Received" && (
                <button
                  onClick={async () => {
                    try {
                      const res = await staffRequestUpdateRentalAsync(rentalId);
                      if (res.success) {
                        alert("Request update has been sent successfully!");
                        onBack();
                      } else {
                        alert(res.message || "Failed to request update.");
                      }
                    } catch (err) {
                      console.error("Failed to request update:", err);
                      alert("Something went wrong. Please try again.");
                    }
                  }}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600"
                >
                  Request Update
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:col-span-2 flex flex-col h-full pb-6">
          {/* TAB BUTTONS */}
          {viewMode === "details" && (
            <div className="flex flex-wrap gap-3 mb-4">
              {grouped.map((g) => (
                <button
                  key={g.roboTypeId}
                  onClick={() => {
                    setActiveType(g.roboTypeId);
                    setPage(0);
                  }}
                  className={`
                    px-4 py-2 rounded-lg font-medium border
                    ${
                      activeType === g.roboTypeId
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  {g.robotTypeName}
                </button>
              ))}
            </div>
          )}

          {/* DETAIL CARD */}
          {viewMode === "details" && currentItem && currentGroup ? (
            <div ref={detailRef} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col h-full">
              {/* TITLE + DESC */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{currentGroup.robotTypeName}</h2>
                <p className="text-gray-600 italic mt-1">{currentGroup.robotTypeDescription}</p>

                {/* CONFIG VALUES */}
                <div className="mt-6 border-t pt-6">
                  <div className="text-lg font-semibold text-gray-900 mb-3">Robot Configuration</div>

                  {currentAbilities.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No config schema for this robot type.</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <ConfigCard
                        title="Branding & UI Configuration"
                        subtitle="Brand name, logo URL, theme assets (colors/banner/background)."
                      >
                        {currentSections.branding.length ? (
                          <RobotAbilityCardForm
                            abilities={currentSections.branding}
                            values={currentConfigValues}
                            errors={{}}
                            disabled
                            onChange={() => {}}
                          />
                        ) : (
                          <EmptySection />
                        )}
                      </ConfigCard>

                      <ConfigCard
                        title="Welcome Screen Configuration"
                        subtitle="Welcome text, intro content, optional greeting script."
                      >
                        {currentSections.welcome.length ? (
                          <RobotAbilityCardForm
                            abilities={currentSections.welcome}
                            values={currentConfigValues}
                            errors={{}}
                            disabled
                            onChange={() => {}}
                          />
                        ) : (
                          <EmptySection />
                        )}
                      </ConfigCard>

                      <ConfigCard title="Call-to-CTA & QR" subtitle="CTA URL / QR content and call-to-action text.">
                        {currentSections.cta.length ? (
                          <RobotAbilityCardForm
                            abilities={currentSections.cta}
                            values={currentConfigValues}
                            errors={{}}
                            disabled
                            onChange={() => {}}
                          />
                        ) : (
                          <EmptySection />
                        )}

                        {currentSections.other.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Other Configuration</div>
                            <RobotAbilityCardForm
                              abilities={currentSections.other}
                              values={currentConfigValues}
                              errors={{}}
                              disabled
                              onChange={() => {}}
                            />
                          </div>
                        )}
                      </ConfigCard>
                    </div>
                  )}
                </div>
              </div>

              {/* PAGINATION */}
              <div className="flex justify-end items-center gap-6 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className={`px-4 py-2 rounded-lg border ${
                    page === 0
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>

                <span className="text-gray-600 text-sm">
                  {page + 1} / {currentGroup.items.length}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === currentGroup.items.length - 1}
                  className={`px-4 py-2 rounded-lg border ${
                    page === currentGroup.items.length - 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : viewMode === "details" ? (
            <p className="text-gray-500 italic">Select a robot type</p>
          ) : null}

          {/* SCHEDULE SECTION */}
          {viewMode === "schedule" && (
            <div ref={scheduleRef} className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Schedule</h2>

              {!schedule ? (
                <p className="text-sm text-gray-500 italic">Click “View Schedules” to show event schedule.</p>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-600" />
                    <span className="font-semibold text-gray-800">{schedule.eventLocation}</span>
                    <span className="text-gray-500 text-sm">({schedule.eventCity})</span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <strong>Delivery:</strong> {schedule.deliveryTime}
                    </div>
                    <div>
                      <strong>Start – End:</strong> {schedule.startTime} – {schedule.endTime}
                    </div>
                    <div>
                      <strong>Finish:</strong> {schedule.finishTime}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-lg 
                        ${schedule.status === "planned" ? "bg-yellow-200 text-yellow-900" : ""}
                        ${schedule.status === "completed" ? "bg-green-200 text-green-900" : ""}
                        ${schedule.status === "cancelled" ? "bg-red-200 text-red-900" : ""}
                      `}
                    >
                      {schedule.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Staff:</strong> {schedule.staffFullName}
                    </div>
                    <div>
                      <strong>Customer:</strong> {schedule.customerFullName}
                    </div>
                    <div>
                      <strong>Rental ID:</strong> {schedule.rentalId}
                    </div>
                  </div>

                  {userRole === "staff" && (
                    <button
                      onClick={() => {
                        if (schedule && onNavigateToScheduleBoard) {
                          onNavigateToScheduleBoard(schedule.activityTypeGroupId);
                        }
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4"
                    >
                      View Full Schedule Board
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function ConfigCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function EmptySection() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
      No fields in this section.
    </div>
  );
}
