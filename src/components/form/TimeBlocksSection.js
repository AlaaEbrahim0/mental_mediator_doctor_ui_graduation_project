import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineMenu } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "../../auth/authProvider";
import { SchedulingForm } from "./SchedulingForm";
import {
    SCHEDULING_BLOCK_TYPES,
    cancelTimeBlock,
    createTimeBlock,
    getTimeBlocks,
} from "../../api/scheduling.api";

const RANGE_DAYS = 60;

const rangeForToday = () => {
    const now = new Date();
    const to = new Date(now);
    to.setDate(to.getDate() + RANGE_DAYS);

    return { fromUtc: now.toISOString(), toUtc: to.toISOString() };
};

/**
 * One-off UTC time blocks. UTC is used because a block can cross a date
 * boundary; the API stores and compares in UTC so no zone conversion is lost.
 */
export const TimeBlocksSection = () => {
    const { userId } = useAuth();
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const range = rangeForToday();
            setBlocks(await getTimeBlocks(userId, range.fromUtc, range.toUtc));
        } catch (error) {
            toast.error(error.message || "Could not load time blocks.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) load();
    }, [userId, load]);

    const handleCreate = async (values) => {
        try {
            await createTimeBlock(userId, {
                startTimeUtc: new Date(values.startAt).toISOString(),
                endTimeUtc: new Date(values.endAt).toISOString(),
                type: values.type,
                privateReason: values.privateReason,
            });
            toast.success("Time block added.");
            setIsCreating(false);
            await load();
        } catch (error) {
            toast.error(error.message || "Could not add the time block.");
        }
    };

    const handleCancel = async (id) => {
        setCancellingId(id);
        try {
            await cancelTimeBlock(userId, id);
            toast.success("Time block cancelled.");
            await load();
        } catch (error) {
            toast.error(error.message || "Could not cancel the time block.");
        } finally {
            setCancellingId(null);
        }
    };

    const formatInstant = (value) =>
        new Date(value).toLocaleString(undefined, {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <section className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Time blocks</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        One-off commitments that take you out of circulation, such as an errand or an
                        external meeting. Stored in UTC.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                >
                    <FaPlus /> Add block
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
                    <SchedulingForm
                        mode="block"
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
                ) : blocks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                        No time blocks in the next {RANGE_DAYS} days.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {blocks.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
                            >
                                <div>
                                    <span className="badge badge-outline badge-warning text-xs font-semibold">
                                        {SCHEDULING_BLOCK_TYPES[item.type] || item.type}
                                    </span>
                                    <p className="mt-2 text-sm font-semibold text-neutral-900">
                                        {formatInstant(item.startTimeUtc)}
                                    </p>
                                    <p className="text-sm text-neutral-600">
                                        until {formatInstant(item.endTimeUtc)}
                                    </p>
                                </div>
                                <div className="dropdown dropdown-end">
                                    <button
                                        type="button"
                                        aria-label="Time block actions"
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
                                                className="btn btn-sm btn-secondary btn-outline w-full"
                                                onClick={() => handleCancel(item.id)}
                                                disabled={cancellingId === item.id}
                                            >
                                                {cancellingId === item.id && (
                                                    <span className="loading loading-spinner" />
                                                )}
                                                Cancel block
                                            </button>
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
