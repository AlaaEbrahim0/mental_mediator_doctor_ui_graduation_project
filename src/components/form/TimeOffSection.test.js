import { act, fireEvent, render, screen } from "@testing-library/react";
import { TimeOffSection } from "./TimeOffSection";
import {
    todayIsoDateIn,
    useDoctorTimeOff,
} from "../../api/schedule.api";

jest.mock("../../api/schedule.api", () => ({
    addDaysIsoDate: jest.fn((date, days) => `${date}+${days}`),
    todayIsoDateIn: jest.fn(),
    useDoctorTimeOff: jest.fn(),
}));

const mockLoad = jest.fn();
const mockCreate = jest.fn();
const mockRemove = jest.fn();

const renderSection = (items = []) => {
    useDoctorTimeOff.mockReturnValue({
        items,
        isLoading: false,
        load: mockLoad,
        create: mockCreate,
        remove: mockRemove,
    });

    return render(<TimeOffSection doctorId="doctor-1" timeZoneId="UTC" />);
};

describe("TimeOffSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLoad.mockReturnValue(new Promise(() => {}));
        mockCreate.mockResolvedValue({});
        mockRemove.mockResolvedValue(undefined);
        todayIsoDateIn.mockReturnValue("2026-11-03");
    });

    it("describes a multi-date full-day range", () => {
        renderSection([
            {
                id: 1,
                date: "2026-11-03",
                endDate: "2026-11-05",
                startTime: "00:00:00",
                endTime: "00:00:00",
                isFullDay: true,
                reason: "Conference",
                startTimeUtc: "2026-11-02T22:00:00Z",
                endTimeUtc: "2026-11-05T22:00:00Z",
            },
        ]);

        expect(screen.getByText(/All days/)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /remove time off/i })
        ).toBeInTheDocument();
    });

    it("submits the inclusive end date for a date range", async () => {
        renderSection();

        fireEvent.change(screen.getByLabelText(/from date/i), {
            target: { value: "2026-11-03" },
        });
        fireEvent.change(screen.getByLabelText(/to date/i), {
            target: { value: "2026-11-05" },
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /add time off/i }));
        });

        expect(mockCreate).toHaveBeenCalledWith(
            "doctor-1",
            expect.objectContaining({
                date: "2026-11-03",
                endDate: "2026-11-05",
                isFullDay: true,
            })
        );
    });

    it("omits the end date for a single-day request", async () => {
        renderSection();

        fireEvent.change(screen.getByLabelText(/from date/i), {
            target: { value: "2026-11-03" },
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /add time off/i }));
        });

        expect(mockCreate).toHaveBeenCalledWith(
            "doctor-1",
            expect.objectContaining({
                date: "2026-11-03",
                endDate: null,
            })
        );
    });
});
