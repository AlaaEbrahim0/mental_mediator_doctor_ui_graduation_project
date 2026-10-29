import { FiActivity, FiCheckCircle, FiClock, FiMessageSquare, FiRefreshCw, FiUserPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, Card, Skeleton } from "../ui";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";

const TYPE_META = {
    room_join: {
        label: "Joined a room",
        icon: <FiUserPlus aria-hidden="true" />,
        tone: "bg-sky-50 text-sky-800",
    },
    note_added: {
        label: "Note added",
        icon: <FiMessageSquare aria-hidden="true" />,
        tone: "bg-primary-50 text-primary-800",
    },
    follow_up_due: {
        label: "Follow-up due",
        icon: <FiClock aria-hidden="true" />,
        tone: "bg-amber-50 text-amber-800",
    },
};

const metaFor = (type) => TYPE_META[type] || {
    label: "Activity",
    icon: <FiActivity aria-hidden="true" />,
    tone: "bg-neutral-100 text-neutral-700",
};

const activityTarget = (item) => {
    if (item.roomId) return `/Community/rooms/${item.roomId}`;

    return null;
};

/**
 * The merged patient activity feed: joins, notes and follow-ups, newest
 * first. Patient names are the API's display names (room aliases for
 * patients), never account emails.
 */
export const ActivityFeed = ({ items, isLoading, error, onRetry }) => {
    return (
        <Card className="flex h-full flex-col">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-neutral-900">Patient activity</h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Joins, notes and follow-ups from the last 30 days
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    loading={isLoading}
                    aria-label="Refresh activity"
                    iconOnly
                >
                    <FiRefreshCw aria-hidden="true" />
                </Button>
            </div>

            {error && (
                <p role="alert" className="mb-3 rounded-xl bg-error/5 px-3 py-2 text-xs font-medium text-error">
                    The feed could not be refreshed.{" "}
                    <button type="button" onClick={onRetry} className="underline">
                        Try again
                    </button>
                </p>
            )}

            {isLoading && !items?.length && (
                <div className="space-y-3" aria-label="Loading activity">
                    {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="flex items-start gap-3">
                            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                            <div className="min-w-0 flex-1">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="mt-2 h-3 w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !items?.length && (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-800">
                        <FiCheckCircle aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-neutral-900">All quiet</p>
                    <p className="mt-1 text-xs text-neutral-600">
                        Patient joins, notes and pending follow-ups will appear here.
                    </p>
                </div>
            )}

            {Boolean(items?.length) && (
                <ul className="space-y-1">
                    {items.map((item, index) => {
                        const meta = metaFor(item.type);
                        const to = activityTarget(item);

                        const body = (
                            <>
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                                    {meta.icon}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-neutral-900">
                                        {item.title}
                                    </span>
                                    {item.detail && (
                                        <span className="mt-0.5 block truncate text-xs text-neutral-600">
                                            {item.detail}
                                        </span>
                                    )}
                                    <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
                                        <span>{meta.label}</span>
                                        {item.patientName && (
                                            <>
                                                <span aria-hidden="true">·</span>
                                                <span>{item.patientName}</span>
                                            </>
                                        )}
                                        <span aria-hidden="true">·</span>
                                        <span>{convertUtcToRelativeTime(item.occurredAtUtc)}</span>
                                    </span>
                                </span>
                            </>
                        );

                        const rowClass = "flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors";

                        return (
                            <li key={`${item.type}-${item.roomId || item.noteId || item.followUpId || "x"}-${index}`}>
                                {to ? (
                                    <Link
                                        to={to}
                                        className={`${rowClass} hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700`}
                                    >
                                        {body}
                                    </Link>
                                ) : (
                                    <div className={rowClass}>{body}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
};
