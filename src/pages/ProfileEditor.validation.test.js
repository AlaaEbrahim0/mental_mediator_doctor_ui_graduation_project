import { buildValidationSchema } from "./ProfileEditor";

jest.mock("../api/client", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
    getApiErrorMessage: jest.fn(() => "Request failed"),
}));

const baseValues = {
    firstName: "Nexus",
    lastName: "Tester",
    birthDate: "1992-06-15",
    gender: "male",
    email: "nexus.test.user@example.com",
    phoneNumber: "",
    city: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    headline: "",
    pronouns: "",
    biography: "",
    coverPhotoUrl: "",
    websiteUrl: "",
    linkedInUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    youTubeUrl: "",
    languages: [],
    interests: [],
    isProfilePublic: true,
    photo: null,
};

const doctorValues = {
    ...baseValues,
    location: "",
    professionalTitle: "",
    clinicName: "",
    qualifications: "",
    yearsOfExperience: "",
    sessionFees: 300,
    specialization: "ClinicalPsychology",
    isAvailable: true,
};

describe("ProfileEditor validation", () => {
    it("allows saving a member profile without a new photo", async () => {
        await expect(
            buildValidationSchema(false).validate(baseValues, {
                abortEarly: false,
            })
        ).resolves.toBeTruthy();
    });

    it("allows saving a doctor profile without a new photo", async () => {
        await expect(
            buildValidationSchema(true).validate(doctorValues, {
                abortEarly: false,
            })
        ).resolves.toBeTruthy();
    });
});
