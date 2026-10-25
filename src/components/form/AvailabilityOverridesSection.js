import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineMenu } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "../../auth/authProvider";
import { CustomDeletionModal } from "../ui/CustomDeletionModal";
import { SchedulingForm } from "./SchedulingForm";
import {
    SCHEDULING_OVERRIDE_TYPES,
    createAvailabilityOverride,
    deleteAvailabilityOverride,
    getAvailabilityOverrides,
} from "../../api/scheduling.api";

const RANGE_DAYS = 60;

const rangeForToday = () => {
    const today = new Date();
    const to = new Date(today);
    to.setDate(to.getDate() + RANGE_DAYS);

    return {
        from: today.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
    };
};

const overrideLabel = (type) =>
    ({
        [SCHEDULING_OVERRIDE_TYPES.FullDayLeave]: "Full day leave",
        [SCHEDULING_OVERRIDE_TYPES.UnavailableInterval]: "Unavailable",
        [SCHEDULING_OVERRIDE_TYPES.ReplaceWorkingHours]: "Replaced hours",
        [SCHEDULING_OVERRIDE_TYPES.AdditionalWorkingSession]: "Extra session",
    })[type] || type;

/**
 * Date-specific availability changes. Unlike recurring breaks these apply once,
 * so the list is scoped to a rolling window around today.
 */
export const AvailabilityOverridesSection = () => {
    const { userId } = useAuth();
    const [overrides, setOverrides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [range, setRange] = useState(rangeForToday);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            setOverrides(await getAvailabilityOverrides(userId, range.from, range.to));
        } catch (error) {
            toast.error(error.message || "Could not load availability overrides.");
        } finally {
            setIsLoading(false);
        }
    }, [userId, range.from, range.to]);

    useEffect(() => {
        if (userId) load();
    }, [userId, load]);

    const handleCreate = async (values) => {
        try {
            await createAvailabilityOverride(userId, values);
            toast.success("Availability override added.");
            setIsCreating(false);
            await load();
        } catch (error) {
            toast.error(error.message || "Could not add the availability override.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteAvailabilityOverride(userId, id);
            toast.success("Availability override removed.");
            await load();
        } catch (error) {
            toast.error(error.message || "Could not remove the availability override.");
        }
    };

    return (
        <section className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Availability overrides</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        One-off changes for a specific date, such as a day of leave or a replaced shift.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                >
                    <FaPlus /> Add override
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
                    <SchedulingForm
                        mode="override"
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            )}

            <div className="mt-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[0, 1].map((index) => (
                            <div
                                key={index}
                                className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
                            />
                        ))}
                    </div>
                ) : overrides.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                        No overrides in the next {RANGE_DAYS} days.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {overrides.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
                            >
                                <div>
                                    <span className="badge badge-outline badge-success text-xs font-semibold">
                                        {overrideLabel(item.type)}
                                    </span>
                                    <p className="mt-2 font-semibold text-neutral-900">
                                        {new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                    {item.startTime && item.endTime && (
                                        <p className="mt-1 text-sm text-neutral-700">
                                            {item.startTime}–{item.endTime}
                                        </p>
                                    )}
                                </div>
                                <div className="dropdown dropdown-end">
                                    <button
                                        type="button"
                                        aria-label="Override actions"
                                        className="btn btn-ghost btn-sm"
                                    >
                                        <HiOutlineMenu />
                                    </button>
                                    <ul
                                        tabIndex={0}
                                        className="dropdown-content z-[1] menu rounded-box bg-base-100 p-2 shadow"
                                    >
                                        <li>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-error btn-outline w-full"
                                                onClick={() =>
                                                    document
                                                        .getElementById(`override-delete-${item.id}`)
                                                        .showModal()
                                                }
                                            >
                                                Delete
                                            </button>
                                            <CustomDeletionModal
                                                id={`override-delete-${item.id}`}
                                                handleConfirm={() => handleDelete(item.id)}
                                            />
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};
