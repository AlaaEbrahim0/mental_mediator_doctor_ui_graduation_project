import { useCallback, useEffect, useState } from "react";
import { FiHash, FiPlus, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import {
    Button,
    Card,
    EmptyState,
    ErrorState,
    Input,
    Select,
    Skeleton,
} from "../components/ui";
import {
    CHAT_ROOM_SORTS,
    CHAT_ROOM_TABS,
    JoinRoomModal,
    RoomCard,
} from "../components/ui/community";
import { CreateRoomModal } from "../components/chat/CreateRoomModal";
import {
    getChatErrorMessage,
    useChatRoomBrowse,
    useJoinChatRoom,
} from "../api/chat.api";

// The tab chip labels are shared vocabulary; the server enum has no dash.
const TAB_VALUES = {
    All: "All",
    Active: "Active",
    Private: "Private",
    Scheduled: "Scheduled",
    "Patient-created": "PatientCreated",
};

const SKELETON_KEYS = [0, 1, 2, 3, 4, 5];

/**
 * The room directory.
 *
 * Filtering, search and sorting run on the server (GET /api/chat/rooms/browse)
 * because the directory is paginated: filtering the loaded page only would
 * silently hide matches on pages that were never fetched. The search input is
 * debounced so typing does not spend the API budget per keystroke.
 */
export const Rooms = () => {
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("All");
    const [sort, setSort] = useState("Recent");
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [joinTarget, setJoinTarget] = useState(null);

    const { rooms, totalCount, hasMore, isLoading, error, load } = useChatRoomBrowse();
    const { execute: joinRoom } = useJoinChatRoom();

    const activeTabValue = TAB_VALUES[tab] || "All";

    const reload = useCallback(
        (override = {}) => load({
            search: query.trim(),
            tab: activeTabValue,
            sort,
            ...override,
        }),
        [load, query, activeTabValue, sort]
    );

    useEffect(() => {
        const handle = setTimeout(() => {
            reload().catch(() => undefined);
        }, 250);

        return () => clearTimeout(handle);
    }, [reload]);

    const handleJoin = async (room, passphrase) => {
        await joinRoom(room.id, passphrase);
        toast.success(`You joined ${room.name}.`);
        reload().catch(() => undefined);
    };

    const handleCreated = async () => {
        toast.success("Room created.");
        reload().catch(() => undefined);
    };

    const hasFilters = Boolean(query.trim()) || tab !== "All";

    return (
        <div className="mx-auto w-full max-w-7xl">
            <section className="mb-5" aria-labelledby="rooms-title">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-800">
                            Community
                        </p>
                        <h1 id="rooms-title" className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                            Rooms
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-neutral-600 sm:text-base">
                            Scheduled sessions, patient-created follow-ups, and live
                            conversations from the care team.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="shrink-0">
                        <FiPlus aria-hidden="true" />
                        Create room
                    </Button>
                </div>
            </section>

            <section
                className="mb-5 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-base-100 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4"
                aria-label="Search and filter rooms"
            >
                <div
                    className="flex flex-wrap gap-1.5"
                    role="group"
                    aria-label="Filter rooms by category"
                >
                    {CHAT_ROOM_TABS.map((label) => {
                        const isActive = label === tab;

                        return (
                            <button
                                key={label}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setTab(label)}
                                className={`inline-flex min-h-9 shrink-0 items-center rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${
                                    isActive
                                        ? "bg-primary-700 text-white shadow-sm"
                                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="relative block sm:w-64">
                        <span className="sr-only">Search rooms</span>
                        <FiSearch
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-neutral-400"
                        />
                        <Input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search rooms"
                            className="pl-10"
                        />
                    </label>

                    <div className="sm:w-40">
                        <Select
                            id="rooms-sort"
                            aria-label="Sort rooms"
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                        >
                            {CHAT_ROOM_SORTS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </section>

            {error && rooms.length === 0 && (
                <ErrorState
                    title="We couldn’t load the rooms"
                    message={getChatErrorMessage(error, "Please try again.")}
                    onRetry={() => reload().catch(() => undefined)}
                />
            )}

            {!error && isLoading && rooms.length === 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading rooms">
                    {SKELETON_KEYS.map((key) => (
                        <Card key={key} padded={false} className="overflow-hidden">
                            <Skeleton rounded="rounded-none" className="h-36 w-full" />
                            <div className="p-4 sm:p-5">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="mt-3 h-4 w-full" />
                                <Skeleton className="mt-2 h-4 w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!error && !isLoading && rooms.length === 0 && !hasFilters && (
                <EmptyState
                    icon={<FiHash aria-hidden="true" />}
                    title="No rooms yet"
                    description="Rooms are where scheduled sessions and patient follow-up conversations happen. Create the first one."
                    action={(
                        <Button onClick={() => setCreateOpen(true)}>
                            <FiPlus aria-hidden="true" />
                            Create room
                        </Button>
                    )}
                />
            )}

            {!error && !isLoading && rooms.length === 0 && hasFilters && (
                <EmptyState
                    icon={<FiSearch aria-hidden="true" />}
                    title="No rooms match these filters"
                    description="Try another category, clear the search, or create a room yourself."
                    action={(
                        <Button
                            variant="outline"
                            onClick={() => {
                                setQuery("");
                                setTab("All");
                            }}
                        >
                            Clear filters
                        </Button>
                    )}
                />
            )}

            {rooms.length > 0 && (
                <>
                    <p className="mb-3 text-xs font-medium text-neutral-500" role="status">
                        {totalCount} {totalCount === 1 ? "room" : "rooms"}
                        {hasFilters ? " match your filters" : ""}
                    </p>
                    <section
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                        aria-label="Rooms"
                    >
                        {rooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                to={`/Community/rooms/${room.id}`}
                                onJoin={setJoinTarget}
                            />
                        ))}
                    </section>
                </>
            )}

            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => reload({ append: true }).catch(() => undefined)}
                        loading={isLoading}
                    >
                        Load more rooms
                    </Button>
                </div>
            )}

            <CreateRoomModal
                isOpen={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={handleCreated}
            />

            <JoinRoomModal
                isOpen={Boolean(joinTarget)}
                room={joinTarget}
                onClose={() => setJoinTarget(null)}
                onJoined={() => setJoinTarget(null)}
                onSubmit={(passphrase) => handleJoin(joinTarget, passphrase)}
            />
        </div>
    );
};
