import { Link } from "react-router-dom";
import {
    FiActivity,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
    FiUsers,
} from "react-icons/fi";
import { Card } from "../ui";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";

const RANGE_OPTIONS = [
    { days: 7, label: "Last 7 days" },
    { days: 30, label: "Last 30 days" },
    { days: 90, label: "Last 90 days" },
];

const statusColor = {
    Completed: "bg-emerald-500",
    Cancelled: "bg-rose-500",
    Pending: "bg-amber-500",
    Confirmed: "bg-sky-500",
};

const StatTile = ({ icon, label, value, tone = "text-neutral-900" }) => (
    <div className="rounded-2xl border border-neutral-200 bg-base-100 p-4">
        <div className="flex items-center gap-2 text-neutral-600">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        </div>
        <p className={`mt-3 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
);

/**
 * Date-range analytics for the doctor dashboard. Every number is scoped to the
 * signed-in doctor on the server and shares the selected window; nothing here
 * is derived on the client from a partial page.
 */
export const DashboardInsights = ({ dashboard, days, onDaysChange, isLoading = false }) => {
    if (!dashboard) return null;

    const statusBreakdown = [
        { status: "Completed", count: dashboard.completedInRange ?? 0 },
        { status: "Confirmed", count: dashboard.confirmedInRange ?? 0 },
        { status: "Pending", count: dashboard.pendingInRange ?? 0 },
        { status: "Cancelled", count: dashboard.cancelledInRange ?? 0 },
    ];
    const total = dashboard.appointmentsInRange ?? statusBreakdown.reduce((sum, item) => sum + item.count, 0);
    const trend = dashboard.trend ?? [];
    const peak = Math.max(1, ...trend.map((point) => (point.completed ?? 0) + (point.cancelled ?? 0)));
    const upcoming = dashboard.upcomingAppointments ?? [];
    const actionable = [
        { label: "Pending requests", value: dashboard.pendingPatientRequests ?? 0, to: "/appointments" },
        { label: "Overdue follow-ups", value: dashboard.followUpsOverdue ?? 0, to: "/workspace" },
        { label: "Follow-ups due soon", value: dashboard.followUpsDueSoon ?? 0, to: "/workspace" },
        { label: "Upcoming appointments", value: upcoming.length, to: "/appointments" },
    ].filter((item) => item.value > 0);

    return (
        <section className="space-y-5" aria-label="Practice insights" aria-busy={isLoading}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Practice insights</h2>
                    <p className="text-sm text-neutral-600">Scoped to your appointments in the selected period.</p>
                </div>
                <div className="join rounded-xl border border-neutral-200 bg-base-100 p-1" role="group" aria-label="Reporting period">
                    {RANGE_OPTIONS.map((option) => (
                        <button
                            key={option.days}
                            type="button"
                            aria-pressed={days === option.days}
                            onClick={() => onDaysChange?.(option.days)}
                            className={`join-item btn btn-xs border-0 sm:btn-sm ${days === option.days ? "bg-primary text-white" : "btn-ghost text-neutral-600"}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatTile icon={<FiCalendar aria-hidden="true" />} label="Appointments" value={dashboard.appointmentsInRange ?? 0} />
                <StatTile icon={<FiCheckCircle aria-hidden="true" />} label="Completed" value={dashboard.completedInRange ?? 0} tone="text-emerald-700" />
                <StatTile icon={<FiUsers aria-hidden="true" />} label="Patients" value={(dashboard.newPatients ?? 0) + (dashboard.returningPatients ?? 0)} />
                <StatTile icon={<FiTrendingUp aria-hidden="true" />} label="New / returning" value={`${dashboard.newPatients ?? 0} / ${dashboard.returningPatients ?? 0}`} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="space-y-4">
                    <h3 className="font-bold text-neutral-900">Appointment status</h3>
                    {total === 0 ? (
                        <p className="text-sm text-neutral-600">No appointments in this period.</p>
                    ) : (
                        <ul className="space-y-3">
                            {statusBreakdown.map((item) => (
                                <li key={item.status}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-neutral-800">{item.status}</span>
                                        <span className="text-neutral-600">{item.count}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100" role="img" aria-label={`${item.status}: ${item.count} of ${total}`}>
                                        <div className={`h-full rounded-full ${statusColor[item.status] || "bg-primary"}`} style={{ width: `${total ? Math.round((item.count / total) * 100) : 0}%` }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="space-y-4">
                    <h3 className="font-bold text-neutral-900">Daily activity</h3>
                    {trend.length === 0 ? (
                        <p className="text-sm text-neutral-600">No completed or cancelled sessions in this period.</p>
                    ) : (
                        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Completed and cancelled appointments per day">
                            {trend.map((point) => {
                                const height = Math.round(((point.completed + point.cancelled) / peak) * 100);
                                return (
                                    <div key={point.dateUtc} className="flex h-full flex-1 flex-col justify-end" title={`${new Date(point.dateUtc).toDateString()}: ${point.completed} completed, ${point.cancelled} cancelled`}>
                                        <div className="flex flex-col justify-end gap-0.5" style={{ height: `${Math.max(height, 2)}%` }}>
                                            {point.cancelled > 0 && <div className="rounded-t bg-rose-400" style={{ height: `${(point.cancelled / (point.completed + point.cancelled || 1)) * 100}%` }} />}
                                            {point.completed > 0 && <div className="bg-emerald-500" style={{ height: `${(point.completed / (point.completed + point.cancelled || 1)) * 100}%` }} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex gap-4 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Completed</span>
                        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> Cancelled</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="space-y-3">
                    <h3 className="font-bold text-neutral-900">Follow-ups</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                            <p className="text-2xl font-bold text-rose-700">{dashboard.followUpsOverdue ?? 0}</p>
                            <p className="text-xs font-semibold text-rose-700">Overdue</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-2xl font-bold text-amber-700">{dashboard.followUpsDueSoon ?? 0}</p>
                            <p className="text-xs font-semibold text-amber-700">Due soon</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <p className="text-2xl font-bold text-emerald-700">{dashboard.followUpsCompletedInRange ?? 0}</p>
                            <p className="text-xs font-semibold text-emerald-700">Completed</p>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-neutral-900">Upcoming schedule</h3>
                        <Link to="/appointments" className="text-sm font-semibold text-primary-800 hover:underline">View all</Link>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="text-sm text-neutral-600">Nothing scheduled ahead in this view.</p>
                    ) : (
                        <ul className="divide-y divide-neutral-200">
                            {upcoming.slice(0, 6).map((appointment) => (
                                <li key={appointment.appointmentId} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-neutral-900">{appointment.patientName}</p>
                                        <p className="text-xs text-neutral-600"><FiClock aria-hidden="true" className="mr-1 inline" />{convertUtcToRelativeTime(appointment.startTimeUtc)}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-semibold capitalize text-neutral-700">{appointment.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            {actionable.length > 0 && (
                <Card className="space-y-3">
                    <h3 className="inline-flex items-center gap-2 font-bold text-neutral-900"><FiActivity aria-hidden="true" /> Needs your attention</h3>
                    <div className="flex flex-wrap gap-2">
                        {actionable.map((item) => (
                            <Link key={item.label} to={item.to} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-base-100 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700">
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">{item.value}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </Card>
            )}
        </section>
    );
};
