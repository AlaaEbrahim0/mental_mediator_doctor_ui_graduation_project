import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";
import { Badge, Button, Card } from "../ui";
import { useGetAppointments } from "../../api/appointments.api";
import { useAuth } from "../../auth/authProvider";
import { getMemberProfilePath } from "../profile/profileUtils";

const statusVariant = {
    pending: "warning",
    confirmed: "success",
};

const formatAppointment = (value, timeZone) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: "—", time: "—" };

    return {
        date: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            timeZone,
        }).format(date),
        time: new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone,
        }).format(date),
    };
};

/**
 * A compact status view beside the schedule. It makes the appointments that
 * reserve slots visible, which is also why a schedule/time-off change can be
 * rejected with a 409.
 */
export const UpcomingAppointmentsCard = ({ timeZone = "UTC" }) => {
    const { execute, isLoading } = useGetAppointments();
    const { userId } = useAuth();
    const [appointments, setAppointments] = useState([]);

    const load = useCallback(async () => {
        const result = await execute({
            startDate: new Date().toISOString(),
            pageSize: 20,
        });
        const active = (result || [])
            .filter((appointment) =>
                ["pending", "confirmed"].includes(String(appointment.status).toLowerCase())
            )
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5);
        setAppointments(active);
    }, [execute]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <Card as="section" aria-labelledby="upcoming-appointments-title">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 id="upcoming-appointments-title" className="text-lg font-bold text-neutral-900">
                        Upcoming appointments
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                        Pending and confirmed appointments reserve their slots.
                    </p>
                </div>
                <Badge variant="primary">{appointments.length}</Badge>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <div className="space-y-2">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="h-14 animate-pulse rounded-xl bg-neutral-100" />
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                        No active appointments in the near future.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {appointments.map((appointment) => {
                            const when = formatAppointment(appointment.startTime, timeZone);
                            const clientPath = getMemberProfilePath(
                                appointment.userId,
                                userId
                            );
                            return (
                                <li
                                    key={appointment.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-neutral-900">
                                            {clientPath ? (
                                                <Link
                                                    to={clientPath}
                                                    className="rounded transition hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                                                >
                                                    {appointment.clientName || "Client"}
                                                </Link>
                                            ) : (
                                                appointment.clientName || "Client"
                                            )}
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 text-xs text-neutral-600">
                                            <FiCalendar aria-hidden="true" /> {when.date}
                                            <FiClock aria-hidden="true" /> {when.time}
                                        </p>
                                    </div>
                                    <Badge
                                        size="sm"
                                        variant={statusVariant[String(appointment.status).toLowerCase()] || "neutral"}
                                        className="capitalize"
                                    >
                                        {appointment.status}
                                    </Badge>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <Button
                as={Link}
                to="/appointments"
                variant="outline"
                size="sm"
                className="mt-4"
            >
                View all appointments <FiArrowRight aria-hidden="true" />
            </Button>
        </Card>
    );
};
