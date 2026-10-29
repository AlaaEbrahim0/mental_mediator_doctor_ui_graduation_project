import { motion } from "framer-motion";
import { FiActivity, FiClock, FiMessageSquare, FiUsers, FiVideo } from "react-icons/fi";

const formatDuration = (minutes) => {
    if (minutes == null) return "—";

    const rounded = Math.round(minutes);
    if (rounded < 60) return `${rounded} min`;

    const hours = Math.floor(rounded / 60);
    const rest = rounded % 60;
    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

/**
 * The five numbers the dashboard leads with.
 *
 * Labels are deliberately literal about what the backend measures: the
 * "average" is of the *scheduled* appointment duration, because the system
 * does not record how long a session actually ran.
 */
export const MetricCards = ({ dashboard }) => {
    const windowDays = dashboard?.averageConsultationWindowDays;
    const metrics = [
        {
            key: "active-consultations",
            label: "Active consultations",
            hint: "In the last 48 hours",
            value: dashboard?.activeConsultations ?? 0,
            icon: <FiActivity aria-hidden="true" />,
            tone: "bg-primary-50 text-primary-800",
        },
        {
            key: "active-patients",
            label: "Active patients",
            hint: windowDays ? `Distinct, last ${windowDays} days` : "Distinct patients",
            value: dashboard?.distinctActivePatients ?? 0,
            icon: <FiUsers aria-hidden="true" />,
            tone: "bg-sky-50 text-sky-800",
        },
        {
            key: "pending-requests",
            label: "Pending requests",
            hint: "Awaiting your confirmation",
            value: dashboard?.pendingPatientRequests ?? 0,
            icon: <FiClock aria-hidden="true" />,
            tone: "bg-amber-50 text-amber-800",
        },
        {
            key: "average-duration",
            label: "Avg scheduled session",
            hint: windowDays ? `Completed, last ${windowDays} days` : "Completed consultations",
            value: formatDuration(dashboard?.averageConsultationDurationMinutes),
            icon: <FiVideo aria-hidden="true" />,
            tone: "bg-emerald-50 text-emerald-800",
        },
        {
            key: "rooms",
            label: "Rooms hosted",
            hint: dashboard?.activeRoomsHosted
                ? `${dashboard.activeRoomsHosted} active right now`
                : "Chat rooms you own",
            value: dashboard?.totalRoomsHosted ?? 0,
            icon: <FiMessageSquare aria-hidden="true" />,
            tone: "bg-violet-50 text-violet-800",
        },
    ];

    return (
        <section
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5"
            aria-label="Practice metrics"
        >
            {metrics.map((metric, index) => (
                <motion.article
                    key={metric.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                            {metric.label}
                        </p>
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${metric.tone}`}>
                            <span className="text-xl">{metric.icon}</span>
                        </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                        {metric.value}
                    </p>
                    <p className="mt-2 text-xs font-medium text-neutral-500">{metric.hint}</p>
                </motion.article>
            ))}
        </section>
    );
};
