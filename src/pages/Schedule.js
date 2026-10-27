import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCalendar, FiClock, FiGlobe, FiRefreshCw } from "react-icons/fi";
import { Alert, Badge, Button, Card, Skeleton } from "../components/ui";
import { WeeklyScheduleEditor } from "../components/form/WeeklyScheduleEditor";
import { TimeOffSection } from "../components/form/TimeOffSection";
import { AvailableSlotsPreview } from "../components/form/AvailableSlotsPreview";
import { UpcomingAppointmentsCard } from "../components/form/UpcomingAppointmentsCard";
import { useAuth } from "../auth/authProvider";
import { useDoctorSchedule } from "../api/schedule.api";

export const Schedule = () => {
    const { userId } = useAuth();
    const {
        data,
        isLoading: isScheduleLoading,
        error: scheduleError,
        load: loadSchedule,
        save: saveSchedule,
    } = useDoctorSchedule();
    const [refreshKey, setRefreshKey] = useState(0);
    const [hasLoaded, setHasLoaded] = useState(false);

    const load = useCallback(async () => {
        if (!userId) return;
        try {
            await loadSchedule(userId);
        } catch (error) {
            toast.error(error.message || "Could not load your schedule.");
        } finally {
            setHasLoaded(true);
        }
    }, [userId, loadSchedule]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (payload) => {
        await saveSchedule(userId, payload);
        setRefreshKey((key) => key + 1);
        toast.success("Schedule saved.");
    };

    const handleTimeOffChanged = () => setRefreshKey((key) => key + 1);

    const workingDays = new Set((data?.periods || []).map((period) => period.dayOfWeek)).size;
    const periodCount = data?.periods?.length || 0;

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6 px-0 text-neutral-800 sm:px-2">
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-base-100 shadow-sm">
                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                            Availability
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                            Your schedule
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                            Patients only see dynamically calculated slots: your weekly periods, minus
                            time off and active appointments. Duration and time zone are applied by the
                            server on every booking.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Badge variant="primary">
                            <FiCalendar aria-hidden="true" /> {workingDays} working days
                        </Badge>
                        <Badge variant="neutral">
                            <FiClock aria-hidden="true" /> {data?.consultationDurationMinutes || 30} min
                        </Badge>
                        <Badge variant="info">
                            <FiGlobe aria-hidden="true" /> {data?.timeZoneId || "UTC"}
                        </Badge>
                        <Badge variant="neutral">{periodCount} periods</Badge>
                    </div>
                </div>
                <div className="border-t border-neutral-200 bg-neutral-50/60 px-5 py-3 text-xs font-medium text-neutral-600 sm:px-6">
                    A schedule change that would leave a Pending or Confirmed appointment outside your
                    availability is rejected instead of silently cancelling it.
                </div>
            </section>

            {!hasLoaded || (isScheduleLoading && !data) ? (
                <Card>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-24 w-full" />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                </Card>
            ) : scheduleError && !data ? (
                <Alert
                    variant="error"
                    title="Could not load your schedule"
                    action={
                        <Button variant="outline" size="sm" onClick={load}>
                            <FiRefreshCw aria-hidden="true" /> Retry
                        </Button>
                    }
                >
                    {scheduleError}
                </Alert>
            ) : (
                <>
                    <WeeklyScheduleEditor
                        schedule={data}
                        onSave={handleSave}
                        isSaving={isScheduleLoading}
                    />

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                        <TimeOffSection
                            doctorId={userId}
                            timeZoneId={data?.timeZoneId || "UTC"}
                            onChanged={handleTimeOffChanged}
                        />
                        <div className="flex flex-col gap-6">
                            <AvailableSlotsPreview
                                doctorId={userId}
                                timeZoneId={data?.timeZoneId || "UTC"}
                                refreshKey={refreshKey}
                            />
                            <UpcomingAppointmentsCard timeZone={data?.timeZoneId || "UTC"} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
