import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineMenu } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "../../auth/authProvider";
import { CustomDeletionModal } from "../ui/CustomDeletionModal";
import { SchedulingForm } from "./SchedulingForm";
import {
    createRecurringBreak,
    deleteRecurringBreak,
    getRecurringBreaks,
} from "../../api/scheduling.api";

/**
 * Recurring weekly breaks — the "when am I normally not working" input.
 *
 * These are the only scheduling input that repeats, so they live on their own
 * card rather than being mixed with one-off overrides and blocks.
 */
export const RecurringBreaksSection = () => {
    const { userId } = useAuth();
    const [breaks, setBreaks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            setBreaks(await getRecurringBreaks(userId));
        } catch (error) {
            toast.error(error.message || "Could not load recurring breaks.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) load();
    }, [userId, load]);

    const handleCreate = async (values) => {
        try {
            await createRecurringBreak(userId, values);
            toast.success("Recurring break added.");
            setIsCreating(false);
            await load();
        } catch (error) {
            toast.error(error.message || "Could not add the recurring break.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteRecurringBreak(userId, id);
            toast.success("Recurring break removed.");
            await load();
        } catch (error) {
            toast.error(error.message || "Could not remove the recurring break.");
        }
    };

    return (
        <section className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Recurring breaks</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Time you are never available each week, such as a lunch break or a fixed day off.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                >
                    <FaPlus /> Add break
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
                    <SchedulingForm
                        mode="break"
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
                ) : breaks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                        No recurring breaks yet. Appointments already avoid your working hours, so you only
                        need these for time inside them.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {breaks.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-neutral-900">
                                        {item.name || "Recurring break"}
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-700">
                                        {item.dayOfWeek} · {item.startTime}–{item.endTime}
                                    </p>
                                </div>
                                <div className="dropdown dropdown-end">
                                    <button
                                        type="button"
                                        aria-label={`Actions for ${item.name || "break"}`}
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
                                                        .getElementById(`break-delete-${item.id}`)
                                                        .showModal()
                                                }
                                            >
                                                Delete
                                            </button>
                                            <CustomDeletionModal
                                                id={`break-delete-${item.id}`}
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
