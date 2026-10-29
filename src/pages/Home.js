import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, registerables, defaults } from "chart.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BsJournalMedical } from "react-icons/bs";
import { useGetDoctorReport } from "../api/appointments.api";
import { MdOutlinePendingActions } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import { GiConfirmed } from "react-icons/gi";
import { useGetNews } from "../api/community.api";
import { FiArrowUpRight, FiBookOpen, FiClock, FiTrendingUp } from "react-icons/fi";
import { FiActivity, FiCalendar, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useUserProfile } from "../context/profileContext";
import { useJoinChatRoom } from "../api/chat.api";
import { useDoctorActivity, useDoctorDashboard } from "../api/workspace.api";
import { JoinRoomModal } from "../components/ui/community";
import { MetricCards } from "../components/dashboard/MetricCards";
import { LiveRoomsPanel } from "../components/dashboard/LiveRoomsPanel";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";

// Register components
ChartJS.register(...registerables);
defaults.responsive = true;
defaults.maintainAspectRatio = false;
defaults.color = "#475569";
defaults.font.family = "Inter, ui-sans-serif, system-ui, sans-serif";

export function Home() {
    const {
        isLoading,
        error,
        execute: executeGetReport,
        data: reportData,
    } = useGetDoctorReport();
    const { userProfileData } = useUserProfile();

    const {
        dashboard,
        isLoading: isDashboardLoading,
        error: dashboardError,
        refresh: refreshDashboard,
    } = useDoctorDashboard();
    const {
        activity,
        isLoading: isActivityLoading,
        error: activityError,
        refresh: refreshActivity,
    } = useDoctorActivity();
    const { execute: joinRoom } = useJoinChatRoom();
    const [joinTarget, setJoinTarget] = useState(null);

    useEffect(() => {
        executeGetReport();
    }, [executeGetReport]);

    const handleJoinRoom = async (room, passphrase) => {
        await joinRoom(room.id, passphrase);
        toast.success(`You joined ${room.name}.`);
        // The room is now open to this doctor, so both the "your rooms"
        // counters and the feed can change.
        refreshDashboard().catch(() => undefined);
        refreshActivity().catch(() => undefined);
    };

    const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdayReports = [...(reportData?.appointmentsPerWeekday || [])].sort(
        (left, right) => weekdayOrder.indexOf(left.dayOfWeek) - weekdayOrder.indexOf(right.dayOfWeek)
    );
    const monthlyReports = reportData?.appointmentsPerMonth || [];
    const testResults = reportData?.testResultsCount || {};
    const statusCounts = reportData?.statusCounts || [];
    const pendingAppointments = statusCounts.find((item) => item.status === "Pending")?.count || 0;
    const confirmedAppointments = statusCounts.find((item) => item.status === "Confirmed")?.count || 0;
    const firstName = userProfileData?.firstName;
    const today = new Date();
    const dateLabel = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 p-1" aria-label="Loading dashboard">
                <div className="space-y-2"><div className="h-7 w-56 rounded bg-neutral-200" /><div className="h-4 w-72 max-w-full rounded bg-neutral-100" /></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl border border-neutral-200 bg-base-100 p-4"><div className="h-10 w-10 rounded-xl bg-neutral-100" /><div className="mt-4 h-4 w-32 rounded bg-neutral-100" /><div className="mt-2 h-7 w-20 rounded bg-neutral-200" /></div>)}</div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><div className="h-80 rounded-2xl border border-neutral-200 bg-base-100 lg:col-span-2" /><div className="h-80 rounded-2xl border border-neutral-200 bg-base-100" /></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-error/20 bg-base-100 p-6 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-error/10 text-error"><FiActivity aria-hidden="true" className="text-xl" /></div>
                <p className="mt-3 font-semibold text-neutral-900">Dashboard data could not be loaded</p>
                <p className="mt-1 text-sm text-neutral-600">Please check your connection and try again.</p>
                <button type="button" onClick={executeGetReport} className="btn btn-primary btn-sm mt-4 rounded-lg">Try again</button>
            </div>
        );
    }

    if (!reportData) return null;

    const metrics = [
        {
            label: "Total appointments",
            value: reportData.totalAppointments ?? 0,
            icon: <BsJournalMedical aria-hidden="true" />,
            tone: "bg-primary-50 text-primary-800",
        },
        {
            label: "Total revenue",
            value: `${reportData.totalProfit ?? 0} EGP`,
            icon: <TbReportMoney aria-hidden="true" />,
            tone: "bg-emerald-50 text-emerald-800",
        },
        {
            label: "Pending appointments",
            value: pendingAppointments,
            icon: <MdOutlinePendingActions aria-hidden="true" />,
            tone: "bg-amber-50 text-amber-800",
        },
        {
            label: "Confirmed appointments",
            value: confirmedAppointments,
            icon: <GiConfirmed aria-hidden="true" />,
            tone: "bg-emerald-50 text-emerald-800",
        },
    ];

    const barData = {
        labels: weekdayReports.map((item) => item.dayOfWeek),
        datasets: [{
            label: "Appointments",
            data: weekdayReports.map((item) => item.count),
            backgroundColor: "rgba(0, 116, 127, 0.16)",
            borderColor: "#00747f",
            borderWidth: 2,
            borderRadius: 8,
            maxBarThickness: 44,
        }],
    };
    const barOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            x: { grid: { display: false }, border: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#e2e8f0" }, border: { display: false } },
        },
    };
    const doughnutData = {
        labels: Object.keys(testResults),
        datasets: [{
            data: Object.values(testResults),
            backgroundColor: ["#00747f", "#76b7b2", "#cbd5e1", "#f59e0b"],
            borderColor: "#ffffff",
            borderWidth: 4,
            hoverOffset: 6,
        }],
    };
    const doughnutOptions = {
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
            title: { display: false },
            legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
        },
    };
    const lineData = {
        labels: monthlyReports.map((item) => item.month),
        datasets: [{
            label: "Appointments",
            data: monthlyReports.map((item) => item.count),
            fill: true,
            borderColor: "#00747f",
            backgroundColor: "rgba(0, 116, 127, 0.10)",
            pointBackgroundColor: "#00747f",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.35,
        }],
    };
    const lineOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            x: { grid: { display: false }, border: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#e2e8f0" }, border: { display: false } },
        },
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-1 text-neutral-900 sm:gap-7 sm:p-2">
            <aside className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950" role="note">
                <strong>Preview:</strong> Patient medical history, prescriptions, and video sessions are not connected because the backend does not yet provide contracts for them. Chat rooms and consultation notes are live.
            </aside>
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end" aria-labelledby="dashboard-title">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-800">Practice overview</p>
                    <h1 id="dashboard-title" className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                        {firstName ? `Welcome back, Dr. ${firstName}` : "Welcome to your dashboard"}
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-600 sm:text-base">A clear view of your practice activity and appointment trends.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-base-100 px-3 text-sm font-medium text-neutral-700">
                        <FiCalendar aria-hidden="true" className="text-primary-800" />{dateLabel}
                    </span>
                    <Link to="/appointments" className="btn btn-primary btn-sm min-h-10 rounded-xl px-4">View appointments <FiChevronRight aria-hidden="true" /></Link>
                    <Link to="/schedule" className="btn btn-ghost btn-sm min-h-10 rounded-xl text-neutral-700">Edit availability</Link>
                </div>
            </section>

            {dashboardError && (
                <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-medium text-error">
                    Your consultation metrics could not be loaded.{" "}
                    <button type="button" onClick={() => refreshDashboard().catch(() => undefined)} className="underline">
                        Try again
                    </button>
                </p>
            )}

            <MetricCards dashboard={dashboard} />

            <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5" aria-label="Rooms and patient activity">
                <LiveRoomsPanel
                    dashboard={dashboard}
                    isLoading={isDashboardLoading}
                    onJoin={setJoinTarget}
                />
                <div className="min-w-0 lg:col-span-2">
                    <ActivityFeed
                        items={activity}
                        isLoading={isActivityLoading}
                        error={activityError}
                        onRetry={() => refreshActivity().catch(() => undefined)}
                    />
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4" aria-label="Practice summary">
                {metrics.map((metric, index) => (
                    <motion.article
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{ y: -2 }}
                        className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 sm:text-sm">{metric.label}</p>
                                <p className="mt-3 break-words text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{metric.value}</p>
                            </div>
                            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${metric.tone}`}>
                                {React.cloneElement(metric.icon, { className: "text-xl" })}
                            </span>
                        </div>
                    </motion.article>
                ))}
            </section>

            <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5" aria-label="Appointment analytics">
                <DashboardChartCard title="Appointments by weekday" description="Weekly distribution" icon={<FiCalendar aria-hidden="true" />} className="lg:col-span-2">
                    <Bar data={barData} options={barOptions} />
                </DashboardChartCard>
                <DashboardChartCard title="Assessment results" description="Patient test outcomes" icon={<FiActivity aria-hidden="true" />}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </DashboardChartCard>
            </section>

            <section className="min-w-0" aria-label="Monthly appointment trend">
                <DashboardChartCard title="Appointment trend" description="Monthly appointment volume" icon={<FiTrendingUp aria-hidden="true" />}>
                    <Line data={lineData} options={lineOptions} />
                </DashboardChartCard>
            </section>

            <JoinRoomModal
                isOpen={Boolean(joinTarget)}
                room={joinTarget}
                onClose={() => setJoinTarget(null)}
                onJoined={() => setJoinTarget(null)}
                onSubmit={(passphrase) => handleJoinRoom(joinTarget, passphrase)}
            />
        </div>
    );
}

function DashboardChartCard({ title, description, icon, className = "", children }) {
    return (
        <article className={`min-w-0 rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 ${className}`}>
            <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-800">{icon}</span>
                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-neutral-900 sm:text-lg">{title}</h2>
                    <p className="text-xs font-medium text-neutral-600 sm:text-sm">{description}</p>
                </div>
            </div>
            <div className="relative h-64 min-w-0 sm:h-72 lg:h-80">{children}</div>
        </article>
    );
}

export function NewsSection() {
    const {
        isLoading: newsLoading,
        error: newsError,
        execute: executeGetNews,
        news,
    } = useGetNews();

    useEffect(() => {
        executeGetNews();
    }, [executeGetNews]);

    if (newsLoading) {
        return (
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-base-100 shadow-sm" aria-label="Loading latest news">
                <div className="border-b border-neutral-200 bg-neutral-50 p-4 sm:p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
                    <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-neutral-200" />
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                    <div className="h-36 animate-pulse rounded-xl bg-neutral-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-neutral-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-neutral-100" />
                </div>
            </section>
        );
    }

    if (newsError) {
        return (
            <section className="rounded-2xl border border-neutral-200 bg-base-100 p-5 shadow-sm" aria-live="polite">
                <p className="text-sm font-semibold text-neutral-900">News is temporarily unavailable</p>
                <p className="mt-1 text-sm text-neutral-600">Please check back in a little while.</p>
            </section>
        );
    }

    if (!newsLoading && !newsError) {
        const articles = news?.articles || [];
        return (
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-base-100 shadow-sm" aria-labelledby="latest-news-title">
                <div className="relative border-b border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-5">
                    <span className="absolute inset-y-0 left-0 w-1 bg-primary-700" aria-hidden="true" />
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-800">
                        <FiTrendingUp aria-hidden="true" /> Your reading brief
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                        <div>
                            <h2 id="latest-news-title" className="text-xl font-bold tracking-tight text-neutral-900">Latest news</h2>
                            <p className="mt-0.5 text-sm text-neutral-600">Psychology, neurology &amp; wellbeing</p>
                        </div>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-base-100 text-primary-800 shadow-sm">
                            <FiBookOpen aria-hidden="true" className="text-lg" />
                        </span>
                    </div>
                </div>
                <div className="space-y-3 p-3 sm:p-4">
                    {articles.length ? articles.slice(0, 5).map((article, index) => (
                        <NewsArticle key={article.url || `${article.title}-${index}`} article={article} featured={index === 0} />
                    )) : (
                        <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center">
                            <p className="text-sm font-semibold text-neutral-800">No stories available</p>
                            <p className="mt-1 text-sm text-neutral-600">New articles will appear here.</p>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return null;
}

function NewsArticle({ article, featured = false }) {
    const publishedDate = article.publishedAt ? new Date(article.publishedAt) : null;
    const validDate = publishedDate && !Number.isNaN(publishedDate.getTime());
    const sourceName = article.source?.name || article.author || "Nexus News";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group w-full overflow-hidden rounded-xl border border-neutral-200 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-700/30 hover:shadow-md ${featured ? "" : "flex items-start gap-3 p-3"}`}
        >
            {featured ? (
                <>
                    {article.urlToImage && <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                        <img src={article.urlToImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                        <span className="absolute left-3 top-3 rounded-full bg-base-100/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-800 shadow-sm">Featured</span>
                    </div>}
                    <div className="p-4">
                        <NewsMeta sourceName={sourceName} publishedAt={validDate ? publishedDate : null} />
                        <h3 className="mt-2 line-clamp-3 text-base font-bold leading-6 text-neutral-900">{article.title}</h3>
                        {article.description && <p className="mt-2 line-clamp-3 text-sm leading-5 text-neutral-700">{article.description}</p>}
                        <NewsLink article={article} featured />
                    </div>
                </>
            ) : (
                <>
                    {article.urlToImage && <img src={article.urlToImage} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                        <NewsMeta sourceName={sourceName} publishedAt={validDate ? publishedDate : null} />
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-neutral-900">{article.title}</h3>
                        <NewsLink article={article} />
                    </div>
                </>
            )}
        </motion.div>
    );
}

function NewsMeta({ sourceName, publishedAt }) {
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-neutral-600">
            <span className="truncate">{sourceName}</span>
            {publishedAt && <><span aria-hidden="true">·</span><time dateTime={publishedAt.toISOString()} className="inline-flex items-center gap-1"><FiClock aria-hidden="true" />{publishedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></>}
        </div>
    );
}

function NewsLink({ article, featured = false }) {
    if (!article.url) return null;
    return (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-9 items-center gap-1 rounded-lg text-sm font-semibold text-primary-800 transition-colors hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${featured ? "mt-3 px-2" : "mt-1"}`}>
            Read story <FiArrowUpRight aria-hidden="true" />
        </a>
    );
}
