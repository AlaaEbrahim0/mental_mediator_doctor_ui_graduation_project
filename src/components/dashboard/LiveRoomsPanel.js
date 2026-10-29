import { FiCalendar, FiChevronRight, FiLock, FiMessageSquare, FiPauseCircle, FiPlus, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Skeleton } from "../ui";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";

const RoomRow = ({ room, onJoin, cta }) => (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-base-100 p-3 transition-colors hover:border-primary-200">
        <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
                <Link
                    to={`/Community/rooms/${room.id}`}
                    className="truncate text-sm font-semibold text-neutral-900 hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                >
                    {room.name}
                </Link>
                {room.isPrivate && (
                    <Badge variant="neutral" size="sm">
                        <FiLock aria-hidden="true" />
                        Private
                    </Badge>
                )}
                {room.isLocked && (
                    <Badge variant="warning" size="sm">
                        <FiPauseCircle aria-hidden="true" />
                        Paused
                    </Badge>
                )}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1">
                    <FiUsers aria-hidden="true" />
                    {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                </span>
                {room.lastMessageAtUtc && (
                    <span className="inline-flex items-center gap-1">
                        <FiMessageSquare aria-hidden="true" />
                        {convertUtcToRelativeTime(room.lastMessageAtUtc)}
                    </span>
                )}
                {room.scheduledStartAtUtc && (
                    <span className="inline-flex items-center gap-1">
                        <FiCalendar aria-hidden="true" />
                        Starts {convertUtcToRelativeTime(room.scheduledStartAtUtc)}
                    </span>
                )}
            </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
            {cta === "join" && !room.isMember ? (
                <Button
                    size="sm"
                    onClick={() => onJoin?.(room)}
                    disabled={room.isArchived || room.isLocked}
                    title={room.isLocked ? "This room is paused." : undefined}
                >
                    Join
                </Button>
            ) : (
                <Link
                    to={`/Community/rooms/${room.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-800 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                >
                    Open
                    <FiChevronRight aria-hidden="true" />
                </Link>
            )}
        </div>
    </li>
);

const RoomList = ({ title, description, empty, rooms, onJoin, cta, icon }) => (
    <div>
        <div className="mb-2 flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-800">
                {icon}
            </span>
            <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-neutral-900">{title}</h3>
                <p className="text-xs text-neutral-500">{description}</p>
            </div>
        </div>
        {rooms.length ? (
            <ul className="space-y-2">
                {rooms.slice(0, 4).map((room) => (
                    <RoomRow key={room.id} room={room} onJoin={onJoin} cta={cta} />
                ))}
            </ul>
        ) : (
            <p className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-center text-xs text-neutral-600">
                {empty}
            </p>
        )}
    </div>
);

/**
 * Live and upcoming rooms.
 *
 * "Live" is the API's definition: a room the doctor hosts with conversation in
 * the last 24 hours. The member count is members, never "online" users, so the
 * copy never claims presence.
 */
export const LiveRoomsPanel = ({ dashboard, isLoading, onJoin }) => {
    if (isLoading && !dashboard) {
        return (
            <Card>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-16 w-full" />
                <Skeleton className="mt-3 h-16 w-full" />
            </Card>
        );
    }

    const liveRooms = dashboard?.liveRooms || [];
    const upcomingRooms = dashboard?.upcomingScheduledRooms || [];

    return (
        <Card className="flex h-full flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-neutral-900">Your rooms</h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Conversations and sessions you host
                    </p>
                </div>
                <Link
                    to="/rooms"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-800 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                >
                    All rooms
                    <FiChevronRight aria-hidden="true" />
                </Link>
            </div>

            <RoomList
                title="Live now"
                description="Activity in the last 24 hours"
                empty="No live conversations yet. Open a room to start one."
                rooms={liveRooms}
                onJoin={onJoin}
                cta="join"
                icon={<FiMessageSquare aria-hidden="true" />}
            />

            <RoomList
                title="Upcoming sessions"
                description="Scheduled starts ahead"
                empty="Nothing scheduled. Add a start time to a room."
                rooms={upcomingRooms}
                onJoin={onJoin}
                cta="open"
                icon={<FiCalendar aria-hidden="true" />}
            />

            <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                <Link to="/rooms" className="btn btn-primary btn-sm min-h-10 rounded-xl">
                    <FiPlus aria-hidden="true" />
                    Create room
                </Link>
                <span className="inline-flex items-center text-xs text-neutral-500">
                    <FiUsers aria-hidden="true" className="mr-1" />
                    {dashboard?.activeRoomsHosted ?? 0} active of {dashboard?.totalRoomsHosted ?? 0} hosted
                </span>
            </div>
        </Card>
    );
};
