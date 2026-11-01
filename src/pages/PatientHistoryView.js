import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getPatientHistory } from "../api/history.api";
import { getApiErrorMessage } from "../api/client";
import { PatientHistoryTimeline } from "../components/history/PatientHistoryTimeline";
import { Alert, Button } from "../components/ui";

export const PatientHistoryView = () => {
    const { patientId } = useParams();
    const [history, setHistory] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [category, setCategory] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (page = 1, activeCategory = category, from = dateFrom, to = dateTo) => {
        if (!patientId) return;
        setIsLoading(true);
        setError("");
        try {
            const result = await getPatientHistory(patientId, page, 20, { category: activeCategory, from, to });
            setHistory(result);
            setPageNumber(page);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "This patient history is not available."));
        } finally {
            setIsLoading(false);
        }
    }, [patientId, category, dateFrom, dateTo]);

    useEffect(() => {
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, category, dateFrom, dateTo]);

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <header className="space-y-3">
                <Link to="/workspace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline">
                    <FiArrowLeft aria-hidden="true" /> Back to workspace
                </Link>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                            {history?.patientName ? `${history.patientName}'s history` : "Patient history"}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600">
                            Appointments with you, your consultation notes and follow-ups.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => load(pageNumber)} loading={isLoading} loadingText="Refreshing…">
                        Refresh
                    </Button>
                </div>
            </header>

            {error && (
                <Alert variant="error" title="History could not be loaded" action={<Button size="sm" variant="ghost" onClick={() => load(pageNumber)}>Try again</Button>}>
                    {error}
                </Alert>
            )}

            <PatientHistoryTimeline
                history={history}
                isLoading={isLoading}
                error={error ? new Error(error) : null}
                onRetry={() => load(pageNumber)}
                onPageChange={load}
                showVisibility
                category={category}
                onCategoryChange={setCategory}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateChange={({ from, to }) => {
                    setDateFrom(from);
                    setDateTo(to);
                }}
            />
        </div>
    );
};
