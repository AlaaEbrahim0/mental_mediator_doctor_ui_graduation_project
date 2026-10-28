import {
    buildCertificateFormData,
    buildProfilePayload,
    buildQualificationPayload,
    toDateOnly,
} from "./profile.api";

jest.mock("./client", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("toDateOnly", () => {
    it("keeps ISO date-only values unchanged", () => {
        expect(toDateOnly("2024-05-02")).toBe("2024-05-02");
        expect(toDateOnly("2024-05-02T23:30:00Z")).toBe("2024-05-02");
    });

    it("formats dates from local date parts", () => {
        expect(toDateOnly(new Date(2024, 4, 2))).toBe("2024-05-02");
    });

    it("returns an empty string for missing or invalid values", () => {
        expect(toDateOnly(null)).toBe("");
        expect(toDateOnly("not-a-date")).toBe("");
    });
});

describe("buildProfilePayload", () => {
    it("cleans optional fields and nested doctor details", () => {
        const payload = buildProfilePayload({
            firstName: "  Maya ",
            lastName: "Hassan",
            birthDate: "1990-03-12",
            gender: "FEMALE",
            biography: "   ",
            city: " Cairo ",
            contactEmail: " hello@practice.com ",
            contactPhone: " +20 100 000 0000 ",
            contactAddress: " 12 Nile Street, Cairo ",
            headline: "  Anxiety specialist ",
            socialLinks: { websiteUrl: "https://ignored.example.com" },
            linkedInUrl: "https://linkedin.com/in/maya",
            youTubeUrl: "https://youtube.com/@maya",
            languages: ["Arabic", " Arabic ", "English"],
            interests: ["Mindfulness", ""],
            isProfilePublic: true,
            doctor: {
                location: " New Cairo ",
                professionalTitle: "Consultant",
                clinicName: "Nexus Clinic",
                qualifications: " MSc Clinical Psychology ",
                yearsOfExperience: "8",
                sessionFees: "450.50",
                specialization: "ClinicalPsychology",
                isAvailable: true,
            },
        });

        expect(payload).toMatchObject({
            firstName: "Maya",
            lastName: "Hassan",
            birthDate: "1990-03-12",
            gender: "female",
            biography: null,
            city: "Cairo",
            contactEmail: "hello@practice.com",
            contactPhone: "+20 100 000 0000",
            contactAddress: "12 Nile Street, Cairo",
            headline: "Anxiety specialist",
            linkedInUrl: "https://linkedin.com/in/maya",
            youTubeUrl: "https://youtube.com/@maya",
            languages: ["Arabic", "English"],
            interests: ["Mindfulness"],
            isProfilePublic: true,
            doctor: {
                location: "New Cairo",
                professionalTitle: "Consultant",
                clinicName: "Nexus Clinic",
                qualifications: "MSc Clinical Psychology",
                yearsOfExperience: 8,
                sessionFees: 450.5,
                specialization: "ClinicalPsychology",
                isAvailable: true,
            },
        });
        // Social links must come from the flat fields, not a stale nested object.
        expect(payload.websiteUrl).toBeNull();
    });

    it("omits doctor details for a regular user", () => {
        const payload = buildProfilePayload({
            firstName: "Maya",
            lastName: "Hassan",
            birthDate: "1990-03-12",
            gender: "female",
            isProfilePublic: false,
        });

        expect(payload.doctor).toBeNull();
        expect(payload.isProfilePublic).toBe(false);
    });
});

describe("certificate form data", () => {
    it("sends the multipart field names the API expects", () => {
        const formData = buildCertificateFormData({
            title: " License ",
            issuingOrganization: "Ministry of Health",
            issueDate: "2024-05-02",
            expiryDate: "2026-05-02",
            credentialId: "ABC-123",
            credentialUrl: "https://verify.example.com/ABC-123",
            description: "Clinical license",
        });

        expect(formData.get("Title")).toBe("License");
        expect(formData.get("IssuingOrganization")).toBe("Ministry of Health");
        expect(formData.get("IssueDate")).toBe("2024-05-02");
        expect(formData.get("ExpiryDate")).toBe("2026-05-02");
        expect(formData.get("CredentialId")).toBe("ABC-123");
        expect(formData.get("CredentialUrl")).toBe(
            "https://verify.example.com/ABC-123"
        );
        expect(formData.get("Description")).toBe("Clinical license");
    });

    it("leaves an empty optional expiry date unset", () => {
        const formData = buildCertificateFormData({
            title: "License",
            issuingOrganization: "Ministry",
            issueDate: "2024-05-02",
            expiryDate: "",
        });

        expect(formData.has("ExpiryDate")).toBe(false);
    });
});

describe("qualification payload", () => {
    it("normalizes year fields for JSON requests", () => {
        expect(
            buildQualificationPayload({
                degree: " MSc ",
                institution: " Cairo University ",
                fieldOfStudy: " ",
                startYear: "2018",
                endYear: "",
            })
        ).toEqual({
            degree: "MSc",
            institution: "Cairo University",
            fieldOfStudy: null,
            startYear: 2018,
            endYear: null,
            description: null,
        });
    });
});
