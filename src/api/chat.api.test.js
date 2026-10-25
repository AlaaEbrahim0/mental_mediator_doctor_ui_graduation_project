import { act, renderHook } from "@testing-library/react";
import apiClient from "./client";
import { useChatRoom, useChatRooms, useSingleFlight } from "./chat.api";

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
