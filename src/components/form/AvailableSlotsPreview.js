import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/authProvider";
import { getAvailableSlots } from "../../api/scheduling.api";

/**
 * Live preview of what the server will offer for a chosen date.
 *
 * This is the useful consequence of moving the calculation server-side: the
 * doctor can see exactly which instants a patient will be offered, including
 * the effect of breaks, overrides and blocks, without guessing.
 */
export const AvailableSlotsPreview = () => {
    const { userId } = useAuth();
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const load = useCallback(async () => {
        if (!userId || !date) return;

        setIsLoading(true);
        try {
            setSlots(await getAvailableSlots(userId, date));
            setHasLoaded(true);
        } catch (error) {
            toast.error(error.message || "Could not load available slots.");
            setSlots([]);
            setHasLoaded(true);
        } finally {
            setIsLoading(false);
        }
    }, [userId, date]);

    useEffect(() => {
        load();
    }, [load]);

    const formatSlot = (value) =>
        value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

    return (
        <section className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Available slots preview</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        What patients are offered on this date, after your working hours, breaks, overrides
                        and blocks.
                    </p>
                </div>
                <label className="block text-sm font-semibold text-neutral-700">
                    Date
                    <input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 sm:w-48"
                    />
                </label>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3].map((index) => (
                            <span
                                key={index}
                                className="h-9 w-20 animate-pulse rounded-lg bg-neutral-100"
                            />
                        ))}
                    </div>
                ) : !hasLoaded ? null : slots.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                        Nothing bookable on this date. Check the working hours, recurring breaks and
                        overrides below.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                            <span
                                key={slot.toISOString()}
                                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-800"
                            >
                                {formatSlot(slot)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
