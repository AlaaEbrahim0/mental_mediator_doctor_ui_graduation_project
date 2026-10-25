import {
    SCHEDULING_BLOCK_TYPES,
    SCHEDULING_OVERRIDE_TYPES,
    getAvailableSlots,
    getAvailabilityOverrides,
    getTimeBlocks,
    normalizeEnumValue,
} from "./scheduling.api";

jest.mock("./client", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        put: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
    },
    getApiErrorMessage: (error, fallback) => error?.message || fallback,
}));

import apiClient from "./client";

afterEach(() => {
    jest.clearAllMocks();
});

describe("normalizeEnumValue", () => {
    it("keeps an enum name the API already sent", () => {
        expect(normalizeEnumValue("UnavailableInterval", SCHEDULING_OVERRIDE_TYPES)).toBe(
            "UnavailableInterval"
        );
    });

    it("maps a numeric enum value to its name", () => {
        expect(normalizeEnumValue(1, SCHEDULING_OVERRIDE_TYPES)).toBe("UnavailableInterval");
    });

    it("passes an unknown value through untouched", () => {
        expect(normalizeEnumValue("SomethingElse", SCHEDULING_BLOCK_TYPES)).toBe("SomethingElse");
    });
});

describe("query parameter serialization", () => {
    it("sends DateOnly as yyyy-mm-dd", async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] });

        await getAvailabilityOverrides("doc-1", "2026-10-25", "2026-11-25");

        expect(apiClient.get).toHaveBeenCalledWith(
            "/api/doctors/doc-1/scheduling/overrides",
            { params: { from: "2026-10-25", to: "2026-11-25" } }
        );
    });

    it("serializes a Date object to an ISO date without the time part", async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] });

        await getAvailableSlots("doc-1", new Date("2026-10-25T15:00:00Z"));

        expect(apiClient.get).toHaveBeenCalledWith("/api/doctors/doc-1/slots", {
            params: { dateTime: "2026-10-25" },
        });
    });

    it("sends UTC bounds for time blocks in full ISO form", async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] });

        await getTimeBlocks(
            "doc-1",
            new Date("2026-10-25T00:00:00Z"),
            new Date("2026-11-25T00:00:00Z")
        );

        const [, config] = apiClient.get.mock.calls[0];
        expect(config.params.fromUtc).toBe("2026-10-25T00:00:00.000Z");
        expect(config.params.toUtc).toBe("2026-11-25T00:00:00.000Z");
    });
});

describe("getAvailableSlots", () => {
    it("converts the server's UTC instants into Date objects", async () => {
        apiClient.get.mockResolvedValueOnce({
            data: ["2026-10-26T09:00:00Z", "2026-10-26T09:30:00Z"],
        });

        const slots = await getAvailableSlots("doc-1", "2026-10-26");

        expect(slots).toHaveLength(2);
        expect(slots[0]).toBeInstanceOf(Date);
        expect(slots[0].toISOString()).toBe("2026-10-26T09:00:00.000Z");
    });

    it("tolerates an empty response", async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] });

        await expect(getAvailableSlots("doc-1", "2026-10-26")).resolves.toEqual([]);
    });

    it("tolerates a null payload", async () => {
        apiClient.get.mockResolvedValueOnce({ data: null });

        await expect(getAvailableSlots("doc-1", "2026-10-26")).resolves.toEqual([]);
    });

    it("surfaces the API's error message", async () => {
        apiClient.get.mockRejectedValueOnce(new Error("Scheduling.AppointmentConflict"));

        await expect(getAvailableSlots("doc-1", "2026-10-26")).rejects.toThrow(
            "Scheduling.AppointmentConflict"
        );
    });
});
