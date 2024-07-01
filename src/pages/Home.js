import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, registerables, defaults } from "chart.js";
import { motion } from "framer-motion";
import { BsJournalMedical } from "react-icons/bs";
import { Appointments } from "./Appointment";
import { useGetAppointments } from "../api/getAppoinments";
import { useGetNews } from "../api/useNews";
import { useEffect, useState } from "react";
import { PostSkeleton } from "../components/ui/PostSkeleton";

// Register components
ChartJS.register(...registerables);
defaults.responsive = true;
defaults.maintainAspectRatio = false;

defaults.plugins.title.display = true;
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "";
defaults.plugins.title.font.family = "sans-serif";
defaults.plugins.title.font.name = "Gilroy";

const labels = ["January", "February", "March", "April"];
const data = {
    labels: labels,
    datasets: [
        {
            label: "My First Dataset",
            data: [65, 59, 80, 81, 56, 55, 40],
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
};

export function Home() {
    return (
        <div className="flex flex-col p-4 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                >
                    <BsJournalMedical className="text-3xl text-primary" />
                    <div>
                        <h4 className="text-lg text-secondary font-bold">
                            Total Profit
                        </h4>
                        <p className="text-info">25,000 EGP</p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                >
                    <BsJournalMedical className="text-3xl text-primary" />
                    <div>
                        <h4 className="text-lg text-secondary font-bold">
                            Pending Appointments
                        </h4>
                        <p className="text-info">30</p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                >
                    <BsJournalMedical className="text-3xl text-primary" />
                    <div>
                        <h4 className="text-lg text-secondary font-bold">
                            Total Profit
                        </h4>
                        <p className="text-info">25,000 EGP</p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white bg-opacity-50 flex flex-col shadow-md justify-center gap-2 glass p-4 rounded-2xl"
                >
                    <BsJournalMedical className="text-3xl text-primary" />
                    <div>
                        <h4 className="text-lg text-secondary font-bold">
                            Total Profit
                        </h4>
                        <p className="text-info">25,000 EGP</p>
                    </div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                <div className="bg-white bg-opacity-50  w-full md:col-span-2 shadow-lg p-8 rounded-2xl h-96">
                    <Line
                        data={{
                            labels: [
                                "January",
                                "February",
                                "March",
                                "April",
                                "May",
                                "June",
                                "July",
                            ],
                            datasets: [
                                {
                                    label: "My First Dataset",
                                    data: [65, 59, 80, 81, 56, 55, 40],
                                    fill: false,
                                    borderColor: "rgb(75, 192, 192)",
                                    tension: 0.1,
                                },
                            ],
                        }}
                        options={{ maintainAspectRatio: false }}
                    />
                </div>
                <div className="bg-white bg-opacity-50  w-full md:col-span-1 shadow-lg p-8 rounded-2xl h-96">
                    <Doughnut
                        data={{
                            labels: ["Depressed", "Not Depressed"],
                            datasets: [
                                {
                                    data: [300, 100],
                                    backgroundColor: [
                                        "rgb(236, 79, 95)",
                                        "rgb(0, 172, 186)",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
                <div className="bg-white bg-opacity-50 overflow-auto w-full shadow-lg p-8 rounded-2xl h-96">
                    <Bar data={data} options={{ maintainAspectRatio: false }} />
                </div>
                <div className="bg-white bg-opacity-50 flex flex-col justify-center w-full shadow-lg p-8 rounded-2xl h-96">
                    <h3 className="text-xl text-secondary font-bold mb-4">
                        Doctors
                    </h3>
                    <div className="flex flex-col justify-center gap-y-8">
                        <div className="flex flex-row">
                            <img
                                src="profile.webp"
                                className="w-12 h-12 rounded-full"
                                alt="profile"
                            ></img>
                            <div className="ml-4">
                                <h4 className="text-lg text-secondary font-bold">
                                    John Doe
                                </h4>
                                <p className="text-info text-sm">
                                    Dermatologist
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-row">
                            <img
                                src="profile.webp"
                                className="w-12 h-12 rounded-full"
                                alt="profile"
                            ></img>
                            <div className="ml-4">
                                <h4 className="text-lg text-secondary font-bold">
                                    Dr. John Doe
                                </h4>
                                <p className="text-info text-sm">
                                    Dermatologist
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-row">
                            <img
                                src="profile.webp"
                                className="w-12 h-12 rounded-full"
                                alt="profile"
                            ></img>
                            <div className="ml-4">
                                <h4 className="text-lg text-secondary font-bold">
                                    Dr. John Doe
                                </h4>
                                <p className="text-info text-sm">
                                    Dermatologist
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-row">
                            <img
                                src="profile.webp"
                                className="w-12 h-12 rounded-full"
                                alt="profile"
                            ></img>
                            <div className="ml-4">
                                <h4 className="text-lg text-secondary font-bold">
                                    Dr. John Doe
                                </h4>
                                <p className="text-info text-sm">
                                    Dermatologist
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-8 mt-8">
                <div className="col-span-2">
                    <Appointments pageSize={4} />
                </div>
                <div className="col-span-1">I don't know</div>
            </div>
        </div>
    );
}
export function NewsSection() {
    const {
        loading: newsLoading,
        error: newsError,
        execute: executeGetNews,
        news,
    } = useGetNews();

    useEffect(() => {
        executeGetNews();
    }, [executeGetNews]);

    return (
        <div className="bg-white bg-opacity-50 shadow-lg p-8 rounded-2xl">
            {newsLoading && <PostSkeleton />}
            {newsError && <div>Error loading news: {newsError.message}</div>}
            <div className="flex flex-col gap-y-8">
                <h3 className="text-2xl text-center text-secondary font-bold mb-4">
                    Latest in Psychology, Neuroscience and more...
                </h3>
                {!newsLoading &&
                    news.articles?.map((article) => (
                        <NewsArticle key={article.url} article={article} />
                    ))}
            </div>
        </div>
    );
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
