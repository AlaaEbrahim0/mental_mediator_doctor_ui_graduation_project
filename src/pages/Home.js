import React, { useEffect } from "react";
import { Bar, Line, Doughnut, PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, registerables, defaults } from "chart.js";
import { motion } from "framer-motion";
import { BsJournalMedical } from "react-icons/bs";
import { useGetDoctorReport } from "../api/getDoctorReports";
import { MdOutlinePendingActions } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import { GiConfirmed } from "react-icons/gi";
import { useGetNews } from "../api/useNews";
import { PostSkeleton } from "../components/ui/PostSkeleton";

// Register components
ChartJS.register(...registerables);
defaults.responsive = true;
defaults.maintainAspectRatio = false;
defaults.plugins.title.display = true;
defaults.plugins.title.font.size = 20;
defaults.plugins.title.font.family = "sans-serif";

export function Home() {
    const {
        isLoading,
        error,
        execute: executeGetReport,
        data: reportData,
    } = useGetDoctorReport();

    useEffect(() => {
        executeGetReport();
    }, [executeGetReport]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center">
                <span className="loading loading-spinner"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center p-4">
                <p className="text-red-500 font-semibold">{error}</p>
            </div>
        );
    }

    if (reportData) {
        return (
            <div className="flex flex-col p-4 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-primary bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                    >
                        <BsJournalMedical className="text-3xl text-secondary " />
                        <div>
                            <h4 className="text-lg text-secondary font-bold">
                                Total Appointments
                            </h4>
                            <p className="text-secondary">
                                {reportData.totalAppointments}
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                    >
                        <TbReportMoney className="text-3xl text-success" />
                        <div>
                            <h4 className="text-lg text-secondary font-bold">
                                Total Profit
                            </h4>
                            <p className="text-info">
                                {reportData.totalProfit} EGP
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                    >
                        <>
                            <MdOutlinePendingActions className="text-3xl text-primary" />
                            <div
                                key={reportData.statusCounts.filter(
                                    (x) => x.status === "Pending"
                                )}
                            >
                                <h4 className="text-lg text-secondary font-bold">
                                    Pending Appointments
                                </h4>
                                <p className="text-info">
                                    {reportData?.statusCounts?.filter(
                                        (x) => x.status === "Pending"
                                    )[0]?.count || 0}
                                </p>
                            </div>
                        </>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                    >
                        <>
                            <GiConfirmed className="text-3xl text-success" />
                            <div
                                key={reportData.statusCounts.filter(
                                    (x) => x.status === "Confirmed"
                                )}
                            >
                                <h4 className="text-lg text-secondary font-bold">
                                    Confirmed Appointments
                                </h4>
                                <p className="text-info">
                                    {reportData?.statusCounts?.filter(
                                        (x) => x.status === "Confirmed"
                                    )[0]?.count || 0}
                                </p>
                            </div>
                        </>
                    </motion.div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                    <div className="bg-white bg-opacity-50  w-full md:col-span-2 shadow-lg p-8 rounded-2xl h-96">
                        <Bar
                            data={{
                                labels: reportData.appointmentsPerWeekday
                                    .sort((x) => x.dayOfWeek)
                                    .map((x) => x.dayOfWeek),
                                datasets: [
                                    {
                                        label: "Appointments Count",
                                        data: reportData.appointmentsPerWeekday.map(
                                            (x) => x.count
                                        ),
                                        backgroundColor: [
                                            "rgba(255, 99, 132, 0.2)",
                                            "rgba(255, 159, 64, 0.2)",
                                            "rgba(255, 205, 86, 0.2)",
                                            "rgba(75, 192, 192, 0.2)",
                                            "rgba(54, 162, 235, 0.2)",
                                            "rgba(153, 102, 255, 0.2)",
                                            "rgba(201, 203, 207, 0.2)",
                                        ],
                                        borderColor: [
                                            "rgb(255, 99, 132)",
                                            "rgb(255, 159, 64)",
                                            "rgb(255, 205, 86)",
                                            "rgb(75, 192, 192)",
                                            "rgb(54, 162, 235)",
                                            "rgb(153, 102, 255)",
                                            "rgb(201, 203, 207)",
                                        ],
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    title: {
                                        text: "Appointments Over Weekdays",
                                        display: true,
                                        color: "rgb(0, 22, 59)",
                                        font: {
                                            size: 20,
                                            family: "sans-serif",
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="bg-white bg-opacity-50  w-full md:col-span-1 shadow-lg p-8 rounded-2xl h-96">
                        <Doughnut
                            data={{
                                labels: Object.keys(
                                    reportData.testResultsCount
                                ),
                                datasets: [
                                    {
                                        data: Object.values(
                                            reportData.testResultsCount
                                        ),
                                        backgroundColor: [
                                            "rgb(236, 79, 95)",
                                            "rgb(0, 172, 186)",
                                            "rgb(0, 22, 59)",
                                        ],
                                        hoverOffset: 4,
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    title: {
                                        text: "Depression Test Results",
                                        display: true,
                                        color: "rgb(0, 22, 59)",
                                        font: {
                                            size: 20,
                                            family: "sans-serif",
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 w-full mt-8">
                    <div className="bg-white bg-opacity-50 overflow-auto w-full shadow-lg p-8 rounded-2xl h-96">
                        <Line
                            data={{
                                labels: reportData.appointmentsPerMonth.map(
                                    (x) => x.month
                                ),
                                datasets: [
                                    {
                                        label: "Appointments Over Months",
                                        data: reportData.appointmentsPerMonth.map(
                                            (x) => x.count
                                        ),
                                        fill: false,
                                        borderColor: "rgb(75, 192, 192)",
                                        tension: 0.1,
                                    },
                                ],
                            }}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    title: {
                                        text: "Appointments Over Months",
                                        display: true,
                                        color: "rgb(0, 22, 59)",
                                        font: {
                                            size: 20,
                                            family: "sans-serif",
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
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
        return <PostSkeleton />;
    }

    if (newsError) {
        return <div>Error loading news: {newsError.message}</div>;
    }

    if (!newsLoading && !newsError && news) {
        return (
            <div className="bg-white bg-opacity-50 shadow-lg p-8 rounded-2xl">
                <h3 className="text-2xl text-center text-secondary font-bold mb-4">
                    Latest in Psychology, Neurology and more...
                </h3>
                <div className="flex flex-col gap-y-8">
                    {news.articles?.map((article) => (
                        <NewsArticle key={article.url} article={article} />
                    ))}
                </div>
            </div>
        );
    }

    return null;
}

function NewsArticle({ article }) {
    return (
        <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="card card-compact bg-white bg-opacity-50 w-full shadow-xl"
        >
            <figure>
                <img src={article.urlToImage} alt={article.title} />
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-secondary">
                    {article.title} - {article.author}
                </h2>
                <span className="text-info text-xs">
                    {new Date(article.publishedAt).toDateString()}
                </span>
                <p className="text-info">{article.description}</p>
                <div className="card-actions justify-end">
                    <a
                        href={article.url}
                        className="btn btn-primary btn-outline "
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Read More
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
