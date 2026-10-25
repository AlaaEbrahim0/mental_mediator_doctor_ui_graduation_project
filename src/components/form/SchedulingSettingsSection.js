import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/authProvider";
import { SchedulingForm } from "./SchedulingForm";
import {
    getSchedulingSettings,
    updateSchedulingSettings,
} from "../../api/scheduling.api";

/**
 * Per-doctor scheduling defaults. The backend falls back to its own defaults
 * when a doctor has no row, so this is shown as read-mostly with an explicit
 * "save" that upserts.
 */
export const SchedulingSettingsSection = () => {
    const { userId } = useAuth();
    const [settings, setSettings] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setSettings(await getSchedulingSettings(userId));
        } catch (error) {
            toast.error(error.message || "Could not load scheduling settings.");
        }
    }, [userId]);

    useEffect(() => {
        if (userId) load();
    }, [userId, load]);

    const handleSubmit = async (values) => {
        setIsSaving(true);
        try {
            const saved = await updateSchedulingSettings(userId, values);
            setSettings(saved);
            setIsEditing(false);
            toast.success("Scheduling settings saved.");
        } catch (error) {
            toast.error(error.message || "Could not save scheduling settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const rows = settings
        ? [
              { label: "Time zone", value: settings.timeZoneId },
              { label: "Slot increment", value: `${settings.slotIncrementMinutes} min` },
              { label: "Buffer before", value: `${settings.bufferBeforeMinutes} min` },
              { label: "Buffer after", value: `${settings.bufferAfterMinutes} min` },
              { label: "Minimum notice", value: `${settings.minimumNoticeMinutes} min` },
              { label: "Book up to", value: `${settings.maxBookingDaysAhead} days ahead` },
          ]
        : [];

    return (
        <section className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Scheduling defaults</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        The rules the slot calculator applies to every date, unless an override says
                        otherwise.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing || !settings}
                >
                    Edit
                </button>
            </div>

            {isEditing && settings && (
                <div className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
                    <SchedulingForm
                        mode="settings"
                        initialData={settings}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsEditing(false)}
                        loading={isSaving}
                    />
                </div>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {rows.map((row) => (
                    <div key={row.label} className="rounded-lg bg-neutral-50 p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                            {row.label}
                        </dt>
                        <dd className="mt-1 text-sm font-bold text-neutral-900">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};
