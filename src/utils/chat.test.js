import {
    CHAT_REPORT_FILTERS,
    CHAT_REPORT_STATUSES,
    canDeleteChatMessage,
    canManageChatMemberRole,
    canModerateRoom,
    canReportChatMessage,
    chatDayKey,
    createClientMessageId,
    formatChatDay,
    formatChatTimestamp,
    getChatMemberInitial,
    isOwnChatMessage,
    isRoomOwner,
    markRoomMemberLeft,
    mergeChatMessages,
    mergeRoomArchiveEvent,
    mergeRoomMemberEvent,
    removeChatMember,
    upsertChatMember,
} from "./chat";

const buildRoom = (overrides = {}) => ({
    id: 12,
    name: "Anxiety support",
    description: "A calm, moderated space.",
    visibility: "Public",
    isArchived: false,
    memberCount: 8,
    isMember: true,
    myRole: "Member",
    myMemberId: 44,
    ...overrides,
});

const buildMessage = (overrides = {}) => ({
    id: 91,
    roomId: 12,
    senderMemberId: 44,
    clientMessageId: "5f0c2d5e-5f4a-4d33-9d1f-0e6c8c1d2a11",
    senderDisplayName: "Dr. Alaa",
    senderIsDoctor: true,
    content: "Hello",
    sentAtUtc: "2026-10-24T00:20:11Z",
    isDeleted: false,
    ...overrides,
});

describe("role predicates", () => {
    it("recognises the room owner by role", () => {
        expect(isRoomOwner(buildRoom({ myRole: "Owner" }))).toBe(true);
        expect(isRoomOwner(buildRoom({ myRole: "Moderator" }))).toBe(false);
        expect(isRoomOwner(buildRoom({ myRole: "Member" }))).toBe(false);
        expect(isRoomOwner(null)).toBe(false);
    });

    it("only lets a member owner or moderator moderate", () => {
        expect(canModerateRoom(buildRoom({ myRole: "Owner" }))).toBe(true);
        expect(canModerateRoom(buildRoom({ myRole: "Moderator" }))).toBe(true);
        expect(canModerateRoom(buildRoom({ myRole: "Member" }))).toBe(false);
        expect(canModerateRoom(buildRoom({ myRole: "Owner", isMember: false }))).toBe(false);
    });

    it("recognises own messages by member id", () => {
        const room = buildRoom({ myMemberId: 44 });
        expect(isOwnChatMessage(buildMessage({ senderMemberId: 44 }), room)).toBe(true);
        expect(isOwnChatMessage(buildMessage({ senderMemberId: 45 }), room)).toBe(false);
        expect(isOwnChatMessage(null, room)).toBe(false);
    });

    it("allows deleting own messages and moderators others", () => {
        const memberRoom = buildRoom({ myRole: "Member", myMemberId: 44 });
        const moderatorRoom = buildRoom({ myRole: "Moderator", myMemberId: 44 });
        const ownerRoom = buildRoom({ myRole: "Owner", myMemberId: 44 });
        expect(canDeleteChatMessage(buildMessage({ senderMemberId: 44 }), memberRoom)).toBe(true);
        expect(canDeleteChatMessage(buildMessage({ senderMemberId: 45 }), memberRoom)).toBe(false);
        expect(canDeleteChatMessage(buildMessage({ senderMemberId: 45 }), moderatorRoom)).toBe(true);
        expect(canDeleteChatMessage(buildMessage({ senderMemberId: 45 }), ownerRoom)).toBe(true);
    });

    it("never allows deleting an already deleted message", () => {
        expect(canDeleteChatMessage(buildMessage({ isDeleted: true }), buildRoom({ myRole: "Owner", myMemberId: 44 }))).toBe(false);
    });

    it("allows reporting other members' messages but not own or deleted ones", () => {
        const room = buildRoom({ myRole: "Member", myMemberId: 44 });
        expect(canReportChatMessage(buildMessage({ senderMemberId: 45 }), room)).toBe(true);
        expect(canReportChatMessage(buildMessage({ senderMemberId: 44 }), room)).toBe(false);
        expect(canReportChatMessage(buildMessage({ senderMemberId: 45, isDeleted: true }), room)).toBe(false);
        expect(canReportChatMessage(buildMessage({ senderMemberId: 45 }), buildRoom({ isMember: false }))).toBe(false);
    });

    it("only lets the owner manage a doctor member role", () => {
        const ownerRoom = buildRoom({ myRole: "Owner", myMemberId: 44 });
        const doctorMember = { memberId: 45, role: "Member", isDoctor: true };
        const patientMember = { memberId: 46, role: "Member", isDoctor: false };
        const ownerMember = { memberId: 44, role: "Owner", isDoctor: true };
        expect(canManageChatMemberRole(ownerRoom, doctorMember)).toBe(true);
        expect(canManageChatMemberRole(ownerRoom, ownerMember)).toBe(false);
        expect(canManageChatMemberRole(ownerRoom, patientMember)).toBe(false);
        expect(canManageChatMemberRole(buildRoom({ myRole: "Moderator" }), doctorMember)).toBe(false);
    });

    it("derives a member initial for the avatar", () => {
        expect(getChatMemberInitial("Dr. Alaa")).toBe("D");
        expect(getChatMemberInitial("  patient ")).toBe("P");
        expect(getChatMemberInitial("")).toBe("?");
        expect(getChatMemberInitial(null)).toBe("?");
    });
});

describe("createClientMessageId", () => {
    it("creates a unique RFC 4122 version 4 GUID", () => {
        const first = createClientMessageId();
        const second = createClientMessageId();
        expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        expect(second).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        expect(first).not.toBe(second);
    });
});

describe("mergeChatMessages", () => {
    it("keeps confirmed messages in ascending id order", () => {
        const older = buildMessage({ id: 40, clientMessageId: "older" });
        const newer = buildMessage({ id: 91, clientMessageId: "newer" });
        const merged = mergeChatMessages([], [newer, older]);
        expect(merged.map((m) => m.id)).toEqual([40, 91]);
    });

    it("drops an optimistic twin once the confirmed message arrives", () => {
        const optimistic = buildMessage({ id: -1, clientMessageId: "pending-1", content: "Hello", pending: true });
        const confirmed = buildMessage({ id: 91, clientMessageId: "pending-1" });
        const merged = mergeChatMessages([optimistic], [confirmed]);
        expect(merged).toHaveLength(1);
        expect(merged[0].id).toBe(91);
        expect(merged[0].pending).toBeUndefined();
    });

    it("dedupes repeated server messages by id", () => {
        const message = buildMessage();
        const merged = mergeChatMessages([message], [message, message]);
        expect(merged).toHaveLength(1);
    });

    it("keeps an optimistic message that has no confirmed counterpart", () => {
        const optimistic = buildMessage({ id: -1, clientMessageId: "pending-2", pending: true });
        const merged = mergeChatMessages([optimistic], []);
        expect(merged).toHaveLength(1);
        expect(merged[0].pending).toBe(true);
    });

    it("does not resurrect an optimistic message that was already confirmed", () => {
        const confirmed = buildMessage({ id: 91, clientMessageId: "pending-3" });
        const optimistic = buildMessage({ id: -1, clientMessageId: "pending-3", pending: true });
        const merged = mergeChatMessages([confirmed], [optimistic]);
        expect(merged).toHaveLength(1);
        expect(merged[0].id).toBe(91);
    });
});

describe("member helpers", () => {
    it("upserts a member by member id and keeps the list sorted", () => {
        const first = { memberId: 44, displayName: "Dr. Alaa", role: "Member" };
        const second = { memberId: 42, displayName: "Patient A1B2", role: "Member" };
        const upserted = upsertChatMember([first], second);
        expect(upserted.map((m) => m.memberId)).toEqual([42, 44]);
        const updated = upsertChatMember(upserted, { memberId: 44, displayName: "Dr. Alaa", role: "Moderator" });
        expect(updated).toHaveLength(2);
        expect(updated.find((m) => m.memberId === 44).role).toBe("Moderator");
    });

    it("removes a member by member id", () => {
        const members = [{ memberId: 42 }, { memberId: 44 }];
        expect(removeChatMember(members, 42)).toEqual([{ memberId: 44 }]);
        expect(removeChatMember(members, 99)).toHaveLength(2);
    });

    it("updates the current user's room role from a member event", () => {
        const room = buildRoom({ myRole: "Member", myMemberId: 44 });
        const merged = mergeRoomMemberEvent(room, {
            memberId: 44,
            displayName: "Dr. Alaa",
            role: "Moderator",
            isDoctor: true,
        });

        expect(merged.myRole).toBe("Moderator");
        expect(merged.isMember).toBe(true);
        expect(merged.myMemberId).toBe(44);
    });

    it("ignores member events for other users", () => {
        const room = buildRoom({ myRole: "Member", myMemberId: 44 });
        const merged = mergeRoomMemberEvent(room, {
            memberId: 45,
            displayName: "Dr. Other",
            role: "Moderator",
        });

        expect(merged).toBe(room);
    });

    it("clears the current user's membership and preview on their own leave event", () => {
        const room = buildRoom({
            myRole: "Member",
            myMemberId: 44,
            lastMessagePreview: "private room content",
        });
        const merged = markRoomMemberLeft(room, 44);

        expect(merged.isMember).toBe(false);
        expect(merged.myRole).toBeNull();
        expect(merged.lastMessagePreview).toBeNull();
    });

    it("does not change the room when another member leaves", () => {
        const room = buildRoom({ myRole: "Owner", myMemberId: 44 });
        expect(markRoomMemberLeft(room, 45)).toBe(room);
    });
});

describe("mergeRoomArchiveEvent", () => {
    it("merges only the shared room fields", () => {
        const room = buildRoom({ myRole: "Member", myMemberId: 44, lastMessagePreview: "mine" });
        const merged = mergeRoomArchiveEvent(room, {
            id: 12,
            name: "Anxiety support",
            description: "A calm, moderated space.",
            visibility: "Public",
            isArchived: true,
            memberCount: 9,
            lastMessageAtUtc: "2026-10-24T00:30:00Z",
            myRole: "Owner",
            myMemberId: 7,
            isMember: true,
            lastMessagePreview: "the owner preview",
        });
        expect(merged.isArchived).toBe(true);
        expect(merged.memberCount).toBe(9);
        expect(merged.myRole).toBe("Member");
        expect(merged.myMemberId).toBe(44);
        expect(merged.lastMessagePreview).toBe("mine");
    });

    it("marks the room as archived when the event omits the flag", () => {
        expect(mergeRoomArchiveEvent(buildRoom(), { id: 12 }).isArchived).toBe(true);
    });

    it("returns the room unchanged when there is no event", () => {
        const room = buildRoom();
        expect(mergeRoomArchiveEvent(room, null)).toBe(room);
    });
});

describe("timestamp formatting", () => {
    it("formats a valid timestamp", () => {
        expect(formatChatTimestamp("2026-10-24T00:20:11Z")).not.toBe("");
    });
    it("returns an empty string for a missing or invalid timestamp", () => {
        expect(formatChatTimestamp(null)).toBe("");
        expect(formatChatTimestamp("")).toBe("");
        expect(formatChatTimestamp("not-a-date")).toBe("");
    });
    it("formats a day label", () => {
        expect(formatChatDay("2026-10-24T00:20:11Z")).not.toBe("");
        expect(formatChatDay("not-a-date")).toBe("");
    });
    it("groups a day into a stable key", () => {
        const morning = chatDayKey(new Date(2026, 9, 24, 8, 0, 0).toISOString());
        const evening = chatDayKey(new Date(2026, 9, 24, 23, 30, 0).toISOString());
        const nextDay = chatDayKey(new Date(2026, 9, 25, 8, 0, 0).toISOString());
        expect(morning).toBe(evening);
        expect(morning).not.toBe(nextDay);
        expect(chatDayKey("not-a-date")).toBe("");
    });
});

describe("report constants", () => {
    it("exposes the server side statuses", () => {
        expect(CHAT_REPORT_STATUSES).toEqual(["Open", "Reviewed", "Dismissed", "Actioned"]);
        expect(CHAT_REPORT_FILTERS).toContain("All");
        expect(CHAT_REPORT_FILTERS).toHaveLength(CHAT_REPORT_STATUSES.length + 1);
    });
});
