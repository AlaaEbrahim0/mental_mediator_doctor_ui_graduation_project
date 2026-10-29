import { act, renderHook } from "@testing-library/react";
import apiClient from "./client";
import {
    getChatErrorCode,
    getChatErrorMessage,
    joinChatRoom,
    useChatRoom,
    useChatRooms,
    useSingleFlight,
} from "./chat.api";

jest.mock("./client", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
    },
    getApiErrorMessage: (error, fallback) => error?.message || fallback,
}));

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, resolve, reject };
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("useSingleFlight", () => {
    it("shares one request for the same loader and arguments", async () => {
        const pending = deferred();
        const loader = jest.fn(() => pending.promise);
        const { result } = renderHook(() => useSingleFlight(loader));

        let first;
        let second;

        act(() => {
            first = result.current("room-1");
            second = result.current("room-1");
        });

        expect(loader).toHaveBeenCalledTimes(1);
        expect(first).toBe(second);

        await act(async () => {
            pending.resolve("ok");
            await first;
        });

        await expect(first).resolves.toBe("ok");
    });

    it("does not collapse requests with different arguments", async () => {
        const firstPending = deferred();
        const secondPending = deferred();
        const loader = jest.fn((key) => (
            key === "a" ? firstPending.promise : secondPending.promise
        ));
        const { result } = renderHook(() => useSingleFlight(loader));

        let first;
        let second;

        act(() => {
            first = result.current("a");
            second = result.current("b");
        });

        expect(loader).toHaveBeenCalledTimes(2);
        expect(first).not.toBe(second);

        await act(async () => {
            firstPending.resolve("a");
            secondPending.resolve("b");
            await Promise.all([first, second]);
        });
    });

    it("starts a new request when the loader identity changes", async () => {
        const firstPending = deferred();
        const secondPending = deferred();
        const firstLoader = jest.fn(() => firstPending.promise);
        const secondLoader = jest.fn(() => secondPending.promise);

        const { result, rerender } = renderHook(
            ({ loader }) => useSingleFlight(loader),
            { initialProps: { loader: firstLoader } }
        );

        let first;
        act(() => {
            first = result.current();
        });

        // This models a room id change: the hook rebuilds its loader, while
        // the call arguments stay empty.
        rerender({ loader: secondLoader });

        let second;
        act(() => {
            second = result.current();
        });

        expect(firstLoader).toHaveBeenCalledTimes(1);
        expect(secondLoader).toHaveBeenCalledTimes(1);
        expect(first).not.toBe(second);

        await act(async () => {
            firstPending.resolve("old-room");
            secondPending.resolve("new-room");
            await Promise.all([first, second]);
        });
    });

    it("clears a rejected request so a retry can run", async () => {
        const failure = new Error("network");
        const loader = jest.fn()
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce("retried");
        const { result } = renderHook(() => useSingleFlight(loader));

        let first;
        act(() => {
            first = result.current();
        });

        await act(async () => {
            await expect(first).rejects.toBe(failure);
        });

        let second;
        act(() => {
            second = result.current();
        });

        await expect(second).resolves.toBe("retried");
        expect(loader).toHaveBeenCalledTimes(2);
    });

    it("turns a synchronous loader throw into a rejected promise", async () => {
        const failure = new Error("sync");
        const loader = jest.fn(() => {
            throw failure;
        });
        const { result } = renderHook(() => useSingleFlight(loader));

        const promise = result.current();

        await expect(promise).rejects.toBe(failure);
    });
});

describe("room-scoped loaders", () => {
    it("lets an explicit room-list refresh win over an older in-flight page", async () => {
        const initialPage = deferred();
        const refreshedPage = deferred();
        apiClient.get
            .mockReturnValueOnce(initialPage.promise)
            .mockReturnValueOnce(refreshedPage.promise);

        const { result } = renderHook(() => useChatRooms());

        let initialRequest;
        act(() => {
            initialRequest = result.current.load();
        });

        let refreshRequest;
        act(() => {
            refreshRequest = result.current.refresh();
        });

        expect(apiClient.get).toHaveBeenCalledTimes(2);

        await act(async () => {
            refreshedPage.resolve({
                data: {
                    rooms: [{ id: 2, name: "New room" }],
                    hasMore: false,
                    nextBeforeRoomId: null,
                },
            });
            await refreshRequest;
        });

        expect(result.current.rooms).toEqual([{ id: 2, name: "New room" }]);

        await act(async () => {
            initialPage.resolve({
                data: {
                    rooms: [{ id: 1, name: "Stale room" }],
                    hasMore: false,
                    nextBeforeRoomId: null,
                },
            });
            await initialRequest;
        });

        // The stale first-page response arrived last and must be discarded.
        expect(result.current.rooms).toEqual([{ id: 2, name: "New room" }]);
    });
    it("does not write an old room response into the new room", async () => {
        const firstRoom = deferred();
        const secondRoom = deferred();

        apiClient.get.mockImplementation((url) => {
            if (url.endsWith("/1")) return firstRoom.promise;
            if (url.endsWith("/2")) return secondRoom.promise;

            throw new Error(`Unexpected request: ${url}`);
        });

        const { result, rerender } = renderHook(
            ({ roomId }) => useChatRoom(roomId),
            { initialProps: { roomId: 1 } }
        );

        let firstRequest;
        act(() => {
            firstRequest = result.current.execute();
        });

        rerender({ roomId: 2 });

        let secondRequest;
        act(() => {
            secondRequest = result.current.execute();
        });

        await act(async () => {
            secondRoom.resolve({ data: { id: 2, name: "Room two" } });
            await secondRequest;
        });

        expect(result.current.room).toEqual({ id: 2, name: "Room two" });

        await act(async () => {
            firstRoom.resolve({ data: { id: 1, name: "Room one" } });
            await firstRequest;
        });

        expect(result.current.room).toEqual({ id: 2, name: "Room two" });
    });
});

const chatError = (code, status = 400) => ({
    response: {
        status,
        data: {
            title: "Chat request failed",
            detail: "server detail",
            errors: [{ code, message: "server message" }],
        },
    },
});

describe("chat error mapping", () => {
    it("reads the machine readable code out of the problem body", () => {
        expect(getChatErrorCode(chatError("Chat.RoomLocked"))).toBe("Chat.RoomLocked");
        expect(getChatErrorCode(new Error("network"))).toBeNull();
    });

    it("maps a wrong passphrase to the same copy the portal shows in a toast", () => {
        expect(getChatErrorMessage(chatError("Chat.RoomPassphraseIncorrect", 403)))
            .toBe("Incorrect room password. Try again.");
        expect(getChatErrorMessage(chatError("Chat.RoomPassphraseRequired", 403)))
            .toBe("This room needs a password to join.");
    });

    it("maps lock and archive states to actionable copy", () => {
        expect(getChatErrorMessage(chatError("Chat.RoomLocked", 409)))
            .toMatch(/paused/i);
        expect(getChatErrorMessage(chatError("Chat.RoomArchived", 409)))
            .toMatch(/archived/i);
    });

    it("maps the room management validation codes", () => {
        expect(getChatErrorMessage(chatError("Chat.InvalidRoomPassphrase")))
            .toMatch(/8 to 128/);
        expect(getChatErrorMessage(chatError("Chat.InvalidScheduledStart")))
            .toMatch(/90 days/);
        expect(getChatErrorMessage(chatError("Chat.InvalidRoomCover")))
            .toMatch(/image/i);
        expect(getChatErrorMessage(chatError("Chat.CreateRoomForbidden", 403)))
            .toMatch(/cannot create rooms/i);
    });

    it("falls back to the generic message for unknown codes and honours a custom fallback", () => {
        expect(getChatErrorMessage(chatError("Chat.SomethingNew")))
            .toBe("Something went wrong. Please try again.");
        expect(getChatErrorMessage(chatError("Chat.SomethingNew"), "Custom fallback"))
            .toBe("Custom fallback");
    });

    it("maps a bare rate limit to its dedicated copy", () => {
        expect(getChatErrorMessage({ response: { status: 429, data: {} } }))
            .toMatch(/rate limit/i);
    });
});

describe("joinChatRoom", () => {
    it("posts no body when no passphrase was collected", async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id: 12 } });

        await joinChatRoom(12, null);

        expect(apiClient.post).toHaveBeenCalledWith("/api/chat/rooms/12/join", undefined);
    });

    it("sends the passphrase in the documented body shape", async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id: 12 } });

        await joinChatRoom(12, "correct horse battery");

        expect(apiClient.post).toHaveBeenCalledWith("/api/chat/rooms/12/join", {
            passphrase: "correct horse battery",
        });
    });

    it("attaches the mapped copy so the shared join modal does not leak the raw detail", async () => {
        const failure = chatError("Chat.RoomPassphraseIncorrect", 403);
        apiClient.post.mockRejectedValueOnce(failure);

        await expect(joinChatRoom(12, "nope")).rejects.toBe(failure);
        expect(failure.friendlyMessage).toBe("Incorrect room password. Try again.");
    });
});
