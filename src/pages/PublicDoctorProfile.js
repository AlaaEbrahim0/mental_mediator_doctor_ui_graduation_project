import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiUserX } from "react-icons/fi";
import { useAuth } from "../auth/authProvider";
import { getPublicProfile } from "../api/profile.api";
import { getApiErrorMessage } from "../api/client";
import { ProfileView } from "../components/profile/ProfileView";
import { getDisplayName, getPublicProfilePath } from "../components/profile/profileUtils";
import {
    Button,
    ErrorState,
    Skeleton,
} from "../components/ui/primitives";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL || "/images";
const patientAppUrl = (process.env.REACT_APP_PATIENT_APP_URL || "").replace(
    /\/+$/,
    ""
);

const PublicProfileSkeleton = () => (
    <div
        className="mx-auto w-full max-w-6xl space-y-6"
        aria-label="Loading profile"
    >
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-base-100">
            <Skeleton className="h-44 w-full rounded-none sm:h-56" />
            <div className="px-4 pb-6 sm:px-6 lg:px-8">
                <Skeleton className="-mt-14 h-28 w-28 rounded-full border-4 border-white sm:-mt-16 sm:h-36 sm:w-36" />
                <Skeleton className="mt-4 h-8 w-64" />
                <Skeleton className="mt-3 h-4 w-full max-w-xl" />
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-5 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item}>
                            <Skeleton className="h-7 w-12" />
                            <Skeleton className="mt-2 h-3 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

export function PublicDoctorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, userId, roles } = useAuth();
    const [state, setState] = useState({
        status: "loading",
        profile: null,
        error: null,
    });
    const [reloadKey, setReloadKey] = useState(0);

    const isDoctorViewer =
        Boolean(token) &&
        Array.isArray(roles) &&
        roles.some(
            (role) =>
                typeof role === "string" &&
                role.toLowerCase() === "doctor"
        );
    const isOwner = Boolean(userId && state.profile?.id === userId);

    useEffect(() => {
        let active = true;
        setState({ status: "loading", profile: null, error: null });

        if (!id) {
            setState({ status: "not-found", profile: null, error: null });
            return () => {
                active = false;
            };
        }

        getPublicProfile(id, { anonymous: !(token && userId === id) })
            .then((profile) => {
                if (!active) return;
                setState({ status: "ready", profile, error: null });
            })
            .catch((error) => {
                if (!active) return;
                if (error.response?.status === 404) {
                    setState({
                        status: "not-found",
                        profile: null,
                        error: null,
                    });
                    return;
                }
                setState({ status: "error", profile: null, error });
            });

        return () => {
            active = false;
        };
    }, [id, reloadKey, token, userId]);

    useEffect(() => {
        if (state.status === "ready" && state.profile) {
            document.title = `${getDisplayName(state.profile)} | Nexus`;
        } else if (state.status === "loading") {
            document.title = "Profile | Nexus";
        }

        return () => {
            document.title = "Nexus";
        };
    }, [state.status, state.profile]);

    const isDoctorProfile = state.profile?.role === "Doctor";
    const bookingUrl =
        isDoctorProfile &&
        state.profile?.doctor?.isAvailable &&
        patientAppUrl
            ? `${patientAppUrl}/doctors/${encodeURIComponent(state.profile.id)}`
            : null;

    const primaryAction =
        !isOwner && bookingUrl ? (
            <Button
                as="a"
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
            >
                <FiCalendar aria-hidden="true" /> Book a session
            </Button>
        ) : null;

    const homeTarget = isDoctorViewer ? "/" : "/login";

    return (
        <div className="min-h-screen bg-canvas text-neutral-900">
            <header className="sticky top-0 z-30 border-b border-neutral-200 bg-base-100/95 backdrop-blur">
                <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
                    <Link
                        to={homeTarget}
                        className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                        aria-label="Nexus home"
                    >
                        <img
                            src={`${imagesDir}/logo-no-background.png`}
                            alt="Nexus"
                            className="h-9 w-12 object-contain"
                        />
                        <span className="text-base font-extrabold tracking-[0.12em] text-neutral-900">
                            NEXUS
                        </span>
                    </Link>

                    <div className="ml-auto flex items-center gap-2">
                        {isDoctorViewer ? (
                            <Button
                                as={Link}
                                to="/"
                                variant="outline"
                                size="sm"
                            >
                                <FiArrowLeft aria-hidden="true" /> Dashboard
                            </Button>
                        ) : (
                            <Button as={Link} to="/login" variant="outline" size="sm">
                                Sign in
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                {state.status === "loading" && <PublicProfileSkeleton />}

                {state.status === "not-found" && (
                    <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200 bg-base-100 px-6 py-14 text-center shadow-card">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-neutral-500">
                            <FiUserX aria-hidden="true" className="text-2xl" />
                        </span>
                        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
                            Profile not available
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                            This profile does not exist or its owner has chosen
                            to keep it private.
                        </p>
                        <Button
                            as={Link}
                            to={homeTarget}
                            variant="outline"
                            className="mt-6"
                        >
                            {isDoctorViewer
                                ? "Back to dashboard"
                                : "Go to Nexus"}
                        </Button>
                    </div>
                )}

                {state.status === "error" && (
                    <div className="mx-auto max-w-xl">
                        <ErrorState
                            title="We couldn't load this profile"
                            message={getApiErrorMessage(
                                state.error,
                                "Check your connection and try again."
                            )}
                            onRetry={() => setReloadKey((key) => key + 1)}
                        />
                    </div>
                )}

                {state.status === "ready" && state.profile && (
                    <>
                        <ProfileView
                            profile={state.profile}
                            isOwner={isOwner}
                            showPublicViewLink={false}
                            primaryAction={primaryAction}
                            onEdit={isOwner ? () => navigate("/profile/edit") : undefined}
                        />
                        {!patientAppUrl &&
                            isDoctorProfile &&
                            state.profile.doctor?.isAvailable && (
                            <p className="mt-6 text-center text-xs text-neutral-500">
                                Appointments are booked through the Nexus
                                patient app.
                            </p>
                        )}
                        <footer className="mt-8 border-t border-neutral-200 pt-5 text-center text-xs text-neutral-500">
                            <p>
                                Nexus · Mental health support with licensed
                                professionals
                            </p>
                            <p className="mt-1">
                                Profile link:{" "}
                                <span className="break-all">
                                    {`${window.location.origin}${getPublicProfilePath(
                                        state.profile.id
                                    )}`}
                                </span>
                            </p>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
}
