import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    FiCalendar,
    FiCheck,
    FiClock,
    FiFilter,
    FiInbox,
    FiMail,
    FiRefreshCw,
    FiX,
} from "react-icons/fi";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import toast from "react-hot-toast";
import { useCompleteAppointment, useConfirmAppointment, useGetAppointments, useRejectAppointment } from "../api/appointments.api";
import { AppointmentsFilterationComponent } from "../components/ui/FilterationComponent";

const statusStyles = {
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-200 bg-rose-50 text-rose-800",
    cancelled: "border-slate-200 bg-slate-100 text-slate-700",
    completed: "border-sky-200 bg-sky-50 text-sky-800",
};

function formatDateTime(value) {
    if (!value || Number.isNaN(new Date(value).getTime())) return null;
    const date = new Date(value);
    return {
        date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        }),
    };
}

function formatDuration(value) {
    if (!value || typeof value !== "string") return "Not specified";
    const parts = value.split(":").map(Number);
    if (parts.some((part) => Number.isNaN(part))) return value;
    const [hours = 0, minutes = 0] = parts;
    const totalMinutes = hours * 60 + minutes;
    if (!totalMinutes) return "Under 1 minute";
    if (!hours) return `${totalMinutes} min`;
    return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?";
}

function StatusBadge({ status }) {
    const label = status || "Unknown";
    const style = statusStyles[label.toLowerCase()] || "border-slate-200 bg-slate-100 text-slate-700";
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${style}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {label}
        </span>
    );
}

function AppointmentDetails({ appointment }) {
    const dateTime = formatDateTime(appointment.startTime);
    return (
        <div className="mt-5 grid gap-3 rounded-xl bg-base-200/70 p-4 sm:grid-cols-3">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date & time</p>
                <p className="mt-1 font-semibold text-slate-900">{dateTime ? `${dateTime.date} · ${dateTime.time}` : "Not specified"}</p>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                <p className="mt-1 font-semibold text-slate-900">{appointment.location || "Not specified"}</p>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Consultation fee</p>
                <p className="mt-1 font-semibold text-slate-900">{appointment.fees != null ? `${appointment.fees} EGP` : "Not specified"}</p>
            </div>
            {appointment.reason && <div className="sm:col-span-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client’s reason</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{appointment.reason}</p></div>}
        </div>
    );
}

function AppointmentModal({
    appointment,
    mode,
    loading,
    rejectionReason,
    setRejectionReason,
    onClose,
    onSubmit,
}) {
    const isConfirm = mode === "confirm";
    const title = isConfirm ? "Confirm appointment" : "Reject appointment";
    const name = appointment.clientName || "Client";
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => event.target === event.currentTarget && !loading && onClose()}
        >
            <motion.section
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="appointment-modal-title"
                className="w-full max-w-xl rounded-2xl border border-base-200 bg-base-100 p-5 shadow-2xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Appointment request</p>
                        <h2 id="appointment-modal-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} disabled={loading} aria-label="Close dialog">
                        <FiX aria-hidden="true" />
                    </button>
                </div>
                <div className="mt-5 flex min-w-0 items-center gap-3">
                    {appointment.clientPhotoUrl ? (
                        <img src={appointment.clientPhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">{getInitials(name)}</div>
                    )}
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{name}</p>
                        <p className="truncate text-sm text-slate-600">{appointment.clientEmail || "No email provided"}</p>
                    </div>
                </div>
                <AppointmentDetails appointment={appointment} />
                {!isConfirm && (
                    <label className="form-control mt-5">
                        <span className="mb-2 text-sm font-semibold text-slate-800">Reason <span className="font-normal text-slate-500">(optional)</span></span>
                        <textarea
                            value={rejectionReason}
                            onChange={(event) => setRejectionReason(event.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Add a short note for the client"
                            className="textarea textarea-bordered w-full resize-y border-slate-300 bg-base-100 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </label>
                )}
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        type="button"
                        className={`btn ${isConfirm ? "btn-primary" : "btn-error"}`}
                        onClick={onSubmit}
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner loading-sm" aria-hidden="true" /> : isConfirm ? <FiCheck aria-hidden="true" /> : <FiX aria-hidden="true" />}
                        {isConfirm ? "Confirm appointment" : "Reject appointment"}
                    </button>
                </div>
            </motion.section>
        </motion.div>
    );
}

export function Appointments({ pageSize = 7 }) {
    const { isLoading, error, data, execute } = useGetAppointments();
    const { isLoading: confirmIsLoading, execute: confirmExecute } = useConfirmAppointment();
    const { isLoading: rejectIsLoading, execute: rejectExecute } = useRejectAppointment();
    const { isLoading: completeIsLoading, execute: completeExecute } = useCompleteAppointment();
    const [pageNumber, setPageNumber] = useState(1);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [modalMode, setModalMode] = useState(null);
    const [isFilterVisible, setFilterVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [filterData, setFilterData] = useState({
        clientName: null,
        startDate: "",
        endDate: "",
        status: null,
        pageSize,
        pageNumber: 1,
    });

    const loadAppointments = useCallback(() => execute(filterData), [execute, filterData]);
    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const appointments = Array.isArray(data) ? data : [];
    const activeFilters = useMemo(() => [
        filterData.clientName && { label: `Client: ${filterData.clientName}`, key: "clientName" },
        filterData.status && { label: `Status: ${filterData.status}`, key: "status" },
        filterData.startDate && { label: `From ${filterData.startDate}`, key: "startDate" },
        filterData.endDate && { label: `Until ${filterData.endDate}`, key: "endDate" },
    ].filter(Boolean), [filterData]);

    const handleFilter = (filters) => {
        setPageNumber(1);
        setFilterData((previous) => ({ ...previous, ...filters, pageNumber: 1 }));
        setFilterVisible(false);
    };

    const clearFilters = () => handleFilter({ clientName: null, startDate: "", endDate: "", status: null });
    const openModal = (appointment, mode) => {
        setCurrentAppointment(appointment);
        setRejectionReason("");
        setModalMode(mode);
    };
    const changePage = (nextPage) => {
        if (nextPage < 1 || (nextPage > pageNumber && appointments.length < pageSize)) return;
        setPageNumber(nextPage);
        setFilterData((previous) => ({ ...previous, pageNumber: nextPage }));
    };

    const submitDecision = async () => {
        if (!currentAppointment) return;
        try {
            const result = modalMode === "complete"
                ? await completeExecute(currentAppointment.id)
                : modalMode === "confirm"
                ? await confirmExecute(currentAppointment.id)
                : await rejectExecute(currentAppointment.id, rejectionReason);
            if (!result) {
                toast.error(`Could not ${modalMode} this appointment. Please try again.`);
                return;
            }
            toast.success(`Appointment ${modalMode === "complete" ? "completed" : modalMode === "confirm" ? "confirmed" : "rejected"}`);
            setModalMode(null);
            setCurrentAppointment(null);
            await execute(filterData);
        } catch (requestError) {
            toast.error(requestError?.message || "Something went wrong. Please try again.");
        }
    };

    const handleComplete = async (appointment) => {
        try {
            await completeExecute(appointment.id);
            toast.success("Appointment completed");
            await execute(filterData);
        } catch (requestError) {
            toast.error(requestError?.message || "Could not complete this appointment. Please try again.");
        }
    };

    if (isLoading && appointments.length === 0) {
        return (
            <section className="w-full rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm sm:p-6" aria-label="Loading appointments">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="space-y-2"><div className="skeleton h-7 w-44" /><div className="skeleton h-4 w-64 max-w-full" /></div>
                    <div className="skeleton h-10 w-24 rounded-lg" />
                </div>
                <div className="space-y-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="skeleton h-[68px] w-full rounded-xl" />)}</div>
            </section>
        );
    }

    return (
        <section className="w-full min-w-0 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm sm:p-6 lg:p-7">
            {isFilterVisible && (
                <div className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6">
                    <AppointmentsFilterationComponent
                        initialFilters={filterData}
                        onClose={() => setFilterVisible(false)}
                        onFilter={handleFilter}
                    />
                </div>
            )}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Appointments</h1>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{appointments.length} shown</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">Review requests and manage your upcoming consultations.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline border-slate-300 bg-base-100 text-slate-700 hover:border-primary hover:bg-primary/5" onClick={loadAppointments} disabled={isLoading}>
                            <FiRefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => setFilterVisible(true)}>
                            <FiFilter aria-hidden="true" /> Filter
                        </button>
                    </div>
                </header>

                {activeFilters.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
                        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Filtered by</span>
                        {activeFilters.map((filter) => (
                            <span key={filter.key} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 py-1 pl-3 pr-1 text-xs font-medium text-slate-700">
                                {filter.label}
                                <button type="button" onClick={() => handleFilter({ [filter.key]: filter.key === "clientName" || filter.key === "status" ? null : "" })} className="grid h-5 w-5 place-items-center rounded-full hover:bg-primary/10" aria-label={`Remove ${filter.label} filter`}><FiX /></button>
                            </span>
                        ))}
                        <button type="button" onClick={clearFilters} className="px-2 py-1 text-xs font-semibold text-primary hover:underline">Clear all</button>
                    </div>
                )}

                {error && (
                    <div role="alert" className="mt-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
                        <p>{error.message || "Appointments could not be loaded."}</p>
                        <button type="button" className="btn btn-sm border-rose-300 bg-white text-rose-800 hover:bg-rose-100" onClick={loadAppointments}><FiRefreshCw /> Try again</button>
                    </div>
                )}

                <div className="mt-6 overflow-hidden rounded-xl border border-base-200">
                    {appointments.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl text-primary"><FiInbox aria-hidden="true" /></div>
                            <h2 className="mt-4 text-lg font-bold text-slate-900">No appointments found</h2>
                            <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">{activeFilters.length ? "Try adjusting your filters to see more appointment requests." : "New appointment requests will appear here when clients book a consultation."}</p>
                            {activeFilters.length > 0 && <button type="button" className="btn btn-primary btn-sm mt-4" onClick={clearFilters}>Clear filters</button>}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse text-left">
                                    <thead className="bg-base-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">Client</th>
                                            <th scope="col" className="px-4 py-3">Date & time</th>
                                            <th scope="col" className="px-4 py-3">Duration</th>
                                            <th scope="col" className="px-4 py-3">Status</th>
                                            <th scope="col" className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-base-200">
                                        {appointments.map((appointment) => {
                                            const dateTime = formatDateTime(appointment.startTime);
                                            const pending = appointment.status?.toLowerCase() === "pending";
                                            const confirmed = appointment.status?.toLowerCase() === "confirmed";
                                            const client = appointment.clientName || "Client";
                                            return (
                                                <motion.tr key={appointment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group transition-colors hover:bg-base-200/40">
                                                    <td className="px-4 py-3">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            {appointment.clientPhotoUrl ? (
                                                                <img src={appointment.clientPhotoUrl} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-full border border-base-200 object-cover" />
                                                            ) : (
                                                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{getInitials(client)}</div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-slate-900">{client}</p>
                                                                <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm text-slate-600"><FiMail className="shrink-0 text-slate-400" aria-hidden="true" /><span className="truncate">{appointment.clientEmail || "No email provided"}</span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="flex items-center gap-2 whitespace-nowrap font-semibold text-slate-900"><FiCalendar className="shrink-0 text-primary" aria-hidden="true" /><span>{dateTime?.date || "Date unavailable"}</span></p>
                                                        <p className="mt-1 whitespace-nowrap pl-6 text-sm text-slate-600">{dateTime?.time || "Time unavailable"}</p>
                                                    </td>
                                                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><FiClock className="text-slate-400" aria-hidden="true" />{formatDuration(appointment.duration)}</span></td>
                                                    <td className="px-4 py-3"><StatusBadge status={appointment.status} /></td>
                                                    <td className="px-4 py-3 text-right">
                                                        {pending ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button type="button" onClick={() => openModal(appointment, "confirm")} className="btn btn-sm btn-primary">Confirm</button>
                                                                <button type="button" onClick={() => openModal(appointment, "reject")} className="btn btn-sm btn-ghost border border-slate-300 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">Decline</button>
                                                            </div>
                                                        ) : confirmed ? (
                                                            <button type="button" onClick={() => handleComplete(appointment)} disabled={completeIsLoading} className="btn btn-sm btn-outline border-sky-300 text-sky-800">{completeIsLoading ? "Updating…" : "Complete"}</button>
                                                        ) : <span className="text-sm text-slate-500">No action needed</span>}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-col gap-3 border-t border-base-200 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <p className="text-sm text-slate-600">Page <span className="font-semibold text-slate-900">{pageNumber}</span> · {appointments.length} appointment{appointments.length === 1 ? "" : "s"}</p>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button type="button" className="btn btn-sm btn-outline border-slate-300 bg-base-100 text-slate-700" onClick={() => changePage(pageNumber - 1)} disabled={pageNumber === 1 || isLoading} aria-label="Previous page"><GrFormPrevious className="text-lg" /> Previous</button>
                                    <button type="button" className="btn btn-sm btn-outline border-slate-300 bg-base-100 text-slate-700" onClick={() => changePage(pageNumber + 1)} disabled={appointments.length < pageSize || isLoading} aria-label="Next page">Next <MdOutlineNavigateNext className="text-lg" /></button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {modalMode && currentAppointment && (
                <AppointmentModal
                    appointment={currentAppointment}
                    mode={modalMode}
                    loading={modalMode === "confirm" ? confirmIsLoading : rejectIsLoading}
                    rejectionReason={rejectionReason}
                    setRejectionReason={setRejectionReason}
                    onClose={() => setModalMode(null)}
                    onSubmit={submitDecision}
                />
            )}
        </section>
    );
}
