import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiArrowLeft,
    FiBriefcase,
    FiCamera,
    FiGlobe,
    FiImage,
    FiLink,
    FiMail,
    FiPlus,
    FiSave,
    FiUser,
    FiX,
} from "react-icons/fi";
import { useUserProfile } from "../context/profileContext";
import { getApiErrorMessage } from "../api/client";
import { toDateOnly, updateMyPhoto } from "../api/profile.api";
import {
    getProfilePhoto,
    getPublicProfilePath,
    PROFILE_PHOTO_FALLBACK,
    safeHttpUrl,
    SPECIALIZATIONS,
} from "../components/profile/profileUtils";
import {
    Alert,
    Button,
    Card,
    ErrorState,
    Input,
    Select,
    Skeleton,
    Textarea,
} from "../components/ui/primitives";

const SOCIAL_INPUTS = [
    {
        name: "websiteUrl",
        label: "Website",
        placeholder: "https://your-practice.com",
    },
    {
        name: "linkedInUrl",
        label: "LinkedIn",
        placeholder: "https://linkedin.com/in/your-name",
    },
    {
        name: "twitterUrl",
        label: "X / Twitter",
        placeholder: "https://x.com/your-handle",
    },
    {
        name: "instagramUrl",
        label: "Instagram",
        placeholder: "https://instagram.com/your-handle",
    },
    {
        name: "facebookUrl",
        label: "Facebook",
        placeholder: "https://facebook.com/your-page",
    },
    {
        name: "youTubeUrl",
        label: "YouTube",
        placeholder: "https://youtube.com/@your-channel",
    },
];

const urlRule = (label, max = 500) =>
    Yup.string()
        .trim()
        .max(max, `${label} must be ${max} characters or fewer`)
        .test("valid-url", "Enter a valid http(s) URL", (value) =>
            !value ? true : Boolean(safeHttpUrl(value))
        );

const todayString = () => toDateOnly(new Date());

const initialValuesFor = (profile) => ({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    birthDate: toDateOnly(profile.birthDate),
    gender: profile.gender || "",
    email: profile.email || "",
    phoneNumber: profile.phoneNumber || "",
    city: profile.city || "",
    contactEmail: profile.contact?.email || "",
    contactPhone: profile.contact?.phone || "",
    contactAddress: profile.contact?.address || "",
    headline: profile.headline || "",
    pronouns: profile.pronouns || "",
    biography: profile.biography || "",
    coverPhotoUrl: profile.coverPhotoUrl || "",
    websiteUrl: profile.socialLinks?.websiteUrl || "",
    linkedInUrl: profile.socialLinks?.linkedInUrl || "",
    twitterUrl: profile.socialLinks?.twitterUrl || "",
    instagramUrl: profile.socialLinks?.instagramUrl || "",
    facebookUrl: profile.socialLinks?.facebookUrl || "",
    youTubeUrl: profile.socialLinks?.youTubeUrl || "",
    languages: profile.languages || [],
    interests: profile.interests || [],
    isProfilePublic: profile.isProfilePublic ?? true,
    photo: null,
    location: profile.doctor?.location || "",
    professionalTitle: profile.doctor?.professionalTitle || "",
    clinicName: profile.doctor?.clinicName || "",
    qualifications: profile.doctor?.qualifications || "",
    yearsOfExperience: profile.doctor?.yearsOfExperience ?? "",
    sessionFees: profile.doctor?.sessionFees ?? 0,
    specialization: profile.doctor?.specialization || "",
    isAvailable: profile.doctor?.isAvailable ?? true,
});

export const buildValidationSchema = (isDoctor) =>
    Yup.object({
        firstName: Yup.string()
            .trim()
            .min(2, "First name must be at least 2 characters")
            .max(64, "First name must be 64 characters or fewer")
            .required("First name is required"),
        lastName: Yup.string()
            .trim()
            .min(2, "Last name must be at least 2 characters")
            .max(64, "Last name must be 64 characters or fewer")
            .required("Last name is required"),
        birthDate: Yup.string()
            .required("Birth date is required")
            .matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid birth date")
            .test(
                "not-in-future",
                "Birth date cannot be in the future",
                (value) => !value || value <= todayString()
            ),
        gender: Yup.string()
            .oneOf(["male", "female"], "Choose a gender")
            .required("Gender is required"),
        phoneNumber: Yup.string().max(
            32,
            "Phone number must be 32 characters or fewer"
        ),
        city: Yup.string().max(100, "City must be 100 characters or fewer"),
        contactEmail: Yup.string()
            .trim()
            .max(200, "Contact email must be 200 characters or fewer")
            .test(
                "valid-email",
                "Enter a valid email address",
                (value) =>
                    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ),
        contactPhone: Yup.string().max(
            40,
            "Contact phone must be 40 characters or fewer"
        ),
        contactAddress: Yup.string().max(
            300,
            "Contact address must be 300 characters or fewer"
        ),
        headline: Yup.string().max(
            160,
            "Headline must be 160 characters or fewer"
        ),
        pronouns: Yup.string().max(
            40,
            "Pronouns must be 40 characters or fewer"
        ),
        biography: Yup.string().max(
            1000,
            "Biography must be 1000 characters or fewer"
        ),
        coverPhotoUrl: urlRule("Cover photo URL", 1000),
        ...Object.fromEntries(
            SOCIAL_INPUTS.map((field) => [field.name, urlRule(field.label)])
        ),
        languages: Yup.array()
            .of(
                Yup.string().max(
                    40,
                    "Each language must be 40 characters or fewer"
                )
            )
            .max(12, "Add at most 12 languages"),
        interests: Yup.array()
            .of(
                Yup.string().max(
                    60,
                    "Each interest must be 60 characters or fewer"
                )
            )
            .max(20, "Add at most 20 interests"),
        photo: Yup.mixed()
            .nullable()
            .test("file-size", "Photo must be smaller than 5 MB", (value) =>
                value instanceof File ? value.size < 5 * 1024 * 1024 : true
            )
            .test(
                "file-type",
                "Use a JPG, PNG, or GIF image",
                (value) =>
                    value instanceof File
                        ? ["image/jpeg", "image/png", "image/gif"].includes(
                              value.type
                          )
                        : true
            ),
        ...(isDoctor
            ? {
                  location: Yup.string().max(
                      200,
                      "Location must be 200 characters or fewer"
                  ),
                  professionalTitle: Yup.string().max(
                      120,
                      "Professional title must be 120 characters or fewer"
                  ),
                  clinicName: Yup.string().max(
                      200,
                      "Clinic name must be 200 characters or fewer"
                  ),
                  qualifications: Yup.string().max(
                      2000,
                      "Qualifications summary must be 2000 characters or fewer"
                  ),
                  yearsOfExperience: Yup.number()
                      .transform((value, originalValue) =>
                          String(originalValue).trim() === "" ? null : value
                      )
                      .nullable()
                      .typeError("Years of experience must be a number")
                      .integer("Years of experience must be a whole number")
                      .min(0, "Years of experience cannot be negative")
                      .max(70, "Years of experience must be 70 or less"),
                  sessionFees: Yup.number()
                      .transform((value, originalValue) =>
                          String(originalValue).trim() === "" ? 0 : value
                      )
                      .typeError("Session fee must be a number")
                      .min(0, "Session fee cannot be negative")
                      .required("Session fee is required"),
                  specialization: Yup.string()
                      .oneOf(
                          SPECIALIZATIONS.map((option) => option.value),
                          "Choose a valid specialization"
                      )
                      .required("Specialization is required"),
              }
            : {}),
    });

const TagField = ({
    id,
    label,
    hint,
    values,
    onChange,
    placeholder,
    maxItems,
    itemMaxLength,
    error,
}) => {
    const [draft, setDraft] = useState("");
    const [localError, setLocalError] = useState("");

    const addTag = () => {
        const value = draft.trim();
        if (!value) return;

        if (values.length >= maxItems) {
            setLocalError(`You can add up to ${maxItems} items.`);
            return;
        }

        if (
            values.some(
                (item) => item.toLowerCase() === value.toLowerCase()
            )
        ) {
            setDraft("");
            setLocalError("");
            return;
        }

        onChange([...values, value]);
        setDraft("");
        setLocalError("");
    };

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-semibold text-neutral-800"
            >
                {label}
            </label>
            <div
                className={`flex min-h-12 flex-wrap items-center gap-2 rounded-xl border bg-base-100 px-3 py-2 transition ${
                    error || localError
                        ? "border-error"
                        : "border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-500/30"
                }`}
            >
                {values.map((value) => (
                    <span
                        key={value}
                        className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 py-1 pl-2.5 pr-1 text-sm font-medium text-primary-900"
                    >
                        {value}
                        <button
                            type="button"
                            onClick={() =>
                                onChange(
                                    values.filter((item) => item !== value)
                                )
                            }
                            aria-label={`Remove ${value}`}
                            className="grid h-5 w-5 place-items-center rounded-full text-primary-700 transition hover:bg-primary-200"
                        >
                            <FiX aria-hidden="true" className="text-xs" />
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    value={draft}
                    maxLength={itemMaxLength}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        if (localError) setLocalError("");
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            addTag();
                        }
                        if (
                            event.key === "Backspace" &&
                            !draft &&
                            values.length > 0
                        ) {
                            onChange(values.slice(0, -1));
                        }
                    }}
                    placeholder={
                        values.length >= maxItems
                            ? `Limit of ${maxItems} reached`
                            : placeholder
                    }
                    disabled={values.length >= maxItems}
                    className="min-w-[10rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed"
                />
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={addTag}
                    disabled={!draft.trim() || values.length >= maxItems}
                    aria-label={`Add ${label.toLowerCase()}`}
                >
                    <FiPlus aria-hidden="true" />
                </Button>
            </div>
            {error || localError ? (
                <p role="alert" className="mt-1.5 text-sm font-medium text-error">
                    {localError || error}
                </p>
            ) : hint ? (
                <p className="mt-1.5 text-xs text-neutral-600">{hint}</p>
            ) : null}
        </div>
    );
};

const FormSection = ({ icon, title, description, children }) => (
    <Card>
        <div className="flex items-start gap-3 border-b border-neutral-200 pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-800">
                {icon}
            </span>
            <div>
                <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
                {description && (
                    <p className="mt-0.5 text-sm leading-6 text-neutral-600">
                        {description}
                    </p>
                )}
            </div>
        </div>
        <div className="mt-5">{children}</div>
    </Card>
);

const EditorSkeleton = () => (
    <div className="mx-auto w-full max-w-4xl space-y-6" aria-label="Loading profile editor">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
);

const ProfileEditorForm = ({ profile }) => {
    const navigate = useNavigate();
    const { updateUserProfile, refreshProfile } = useUserProfile();
    const isDoctor = Boolean(profile.doctor);
    const photoInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(() =>
        getProfilePhoto(profile)
    );
    const [submitError, setSubmitError] = useState("");

    const validationSchema = useMemo(
        () => buildValidationSchema(isDoctor),
        [isDoctor]
    );

    const formik = useFormik({
        initialValues: initialValuesFor(profile),
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            setSubmitError("");
            let profileSaved = false;

            try {
                await updateUserProfile({
                    ...values,
                    doctor: isDoctor
                        ? {
                              location: values.location,
                              professionalTitle: values.professionalTitle,
                              clinicName: values.clinicName,
                              qualifications: values.qualifications,
                              yearsOfExperience: values.yearsOfExperience,
                              sessionFees: values.sessionFees,
                              specialization: values.specialization,
                              isAvailable: values.isAvailable,
                          }
                        : null,
                });
                profileSaved = true;

                if (values.photo) {
                    await updateMyPhoto(values.photo);
                }

                await refreshProfile();
                toast.success("Profile updated successfully");
                navigate("/profile");
            } catch (error) {
                setSubmitError(
                    profileSaved
                        ? `Your profile details were saved, but the photo upload failed. ${getApiErrorMessage(
                              error,
                              "Try uploading the photo again."
                          )}`
                        : getApiErrorMessage(
                              error,
                              "Your profile could not be saved. Please try again."
                          )
                );
                helpers.setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        if (!formik.values.photo) {
            setPhotoPreview(getProfilePhoto(profile));
        }
    }, [formik.values.photo, profile]);

    const coverPreview = safeHttpUrl(formik.values.coverPhotoUrl);

    const handlePhotoChange = (event) => {
        const file = event.currentTarget.files?.[0] || null;
        formik.setFieldValue("photo", file, true);

        if (!file) {
            setPhotoPreview(getProfilePhoto(profile));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Button
                        as={Link}
                        to="/profile"
                        variant="ghost"
                        size="sm"
                        className="-ml-2"
                    >
                        <FiArrowLeft aria-hidden="true" /> Back to profile
                    </Button>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
                        Edit profile
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        This information appears on your public profile.
                    </p>
                </div>
                <Button
                    as={Link}
                    to={getPublicProfilePath(profile.id)}
                    variant="outline"
                    size="sm"
                >
                    Preview public profile
                </Button>
            </div>

            {submitError && (
                <Alert variant="error" title="Could not save your profile">
                    {submitError}
                </Alert>
            )}

            <FormSection
                icon={<FiCamera aria-hidden="true" />}
                title="Profile appearance"
                description="Choose the photo and cover image patients see first."
            >
                <div className="overflow-hidden rounded-2xl border border-neutral-200">
                    <div className="relative h-36 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 sm:h-44">
                        {coverPreview && (
                            <img
                                src={coverPreview}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        )}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                            Cover preview
                        </span>
                    </div>
                    <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-end">
                        <div className="-mt-12 shrink-0 sm:-mt-14">
                            <img
                                src={photoPreview || PROFILE_PHOTO_FALLBACK}
                                alt="Profile preview"
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src =
                                        PROFILE_PHOTO_FALLBACK;
                                }}
                                className="h-24 w-24 rounded-full border-4 border-white bg-neutral-100 object-cover shadow-lg sm:h-28 sm:w-28"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pb-1">
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                className="sr-only"
                                onChange={handlePhotoChange}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => photoInputRef.current?.click()}
                            >
                                <FiImage aria-hidden="true" />{" "}
                                {formik.values.photo
                                    ? "Choose another photo"
                                    : "Change photo"}
                            </Button>
                            {formik.values.photo && (
                                <span className="max-w-[14rem] truncate text-xs font-medium text-neutral-600">
                                    {formik.values.photo.name}
                                </span>
                            )}
                            <span className="text-xs text-neutral-500">
                                JPG, PNG, or GIF · under 5 MB
                            </span>
                        </div>
                    </div>
                </div>

                {formik.touched.photo && formik.errors.photo && (
                    <p role="alert" className="mt-2 text-sm font-medium text-error">
                        {formik.errors.photo}
                    </p>
                )}

                <div className="mt-4">
                    <Input
                        label="Cover photo URL"
                        name="coverPhotoUrl"
                        type="url"
                        placeholder="https://images.example.com/your-cover.jpg"
                        value={formik.values.coverPhotoUrl}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.coverPhotoUrl &&
                            formik.errors.coverPhotoUrl
                        }
                        hint="Optional. Use a landscape image at least 1200 px wide."
                    />
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary mt-0.5"
                        checked={formik.values.isProfilePublic}
                        onChange={formik.handleChange}
                        name="isProfilePublic"
                    />
                    <span>
                        <span className="block text-sm font-semibold text-neutral-900">
                            Public profile
                        </span>
                        <span className="mt-0.5 block text-sm leading-6 text-neutral-600">
                            When enabled, anyone with your profile link can
                            view it without signing in. Turn it off to keep
                            your profile private.
                        </span>
                    </span>
                </label>
            </FormSection>

            <FormSection
                icon={<FiUser aria-hidden="true" />}
                title="Personal information"
                description="Your name and basic details. Your email is never shown publicly."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="First name"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.firstName && formik.errors.firstName}
                        autoComplete="given-name"
                        required
                    />
                    <Input
                        label="Last name"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lastName && formik.errors.lastName}
                        autoComplete="family-name"
                        required
                    />
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        disabled
                        hint="Contact support to change the email on your account."
                    />
                    <Input
                        label="Phone number"
                        name="phoneNumber"
                        type="tel"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.phoneNumber &&
                            formik.errors.phoneNumber
                        }
                        autoComplete="tel"
                        placeholder="Optional"
                        hint="Private. Use the contact section below for a number shown on your profile."
                    />
                    <Input
                        label="Birth date"
                        name="birthDate"
                        type="date"
                        max={todayString()}
                        value={formik.values.birthDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.birthDate && formik.errors.birthDate
                        }
                        required
                    />
                    <Select
                        label="Gender"
                        name="gender"
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.gender && formik.errors.gender}
                        required
                    >
                        <option value="" disabled>
                            Select gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </Select>
                    <div className="sm:col-span-2">
                        <Input
                            label="City"
                            name="city"
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.city && formik.errors.city}
                            placeholder="Cairo"
                            autoComplete="address-level2"
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection
                icon={<FiMail aria-hidden="true" />}
                title="Contact information"
                description="These details are public. Use professional contact details you are comfortable sharing."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Public email"
                        name="contactEmail"
                        type="email"
                        value={formik.values.contactEmail}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.contactEmail &&
                            formik.errors.contactEmail
                        }
                        placeholder="hello@your-practice.com"
                        autoComplete="email"
                        hint="Shown to anyone who views your public profile."
                    />
                    <Input
                        label="Public phone"
                        name="contactPhone"
                        type="tel"
                        value={formik.values.contactPhone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.contactPhone &&
                            formik.errors.contactPhone
                        }
                        placeholder="+20 100 000 0000"
                        autoComplete="tel"
                        hint="Shown on your public profile."
                    />
                    <div className="sm:col-span-2">
                        <Textarea
                            label="Practice address"
                            name="contactAddress"
                            rows={2}
                            value={formik.values.contactAddress}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.contactAddress &&
                                formik.errors.contactAddress
                            }
                            placeholder="Clinic name, street, building, floor, city"
                            hint="Optional. Your public city is shown separately."
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection
                icon={<FiGlobe aria-hidden="true" />}
                title="About you"
                description="A headline, biography, and the languages you work in."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Headline"
                        name="headline"
                        value={formik.values.headline}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.headline && formik.errors.headline}
                        placeholder="Clinical psychologist helping adults manage anxiety"
                        hint={`${formik.values.headline.length}/160 characters`}
                    />
                    <Input
                        label="Pronouns"
                        name="pronouns"
                        value={formik.values.pronouns}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.pronouns && formik.errors.pronouns}
                        placeholder="she/her, he/him, they/them"
                    />
                    <div className="sm:col-span-2">
                        <Textarea
                            label="Biography"
                            name="biography"
                            rows={5}
                            value={formik.values.biography}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.biography &&
                                formik.errors.biography
                            }
                            placeholder="Share your approach, experience, and what a first session with you is like."
                            hint={`${formik.values.biography.length}/1000 characters`}
                        />
                    </div>
                    <TagField
                        id="profile-languages"
                        label="Languages"
                        values={formik.values.languages}
                        onChange={(values) =>
                            formik.setFieldValue("languages", values, true)
                        }
                        placeholder="e.g. Arabic"
                        maxItems={12}
                        itemMaxLength={40}
                        error={
                            formik.touched.languages &&
                            formik.errors.languages
                        }
                        hint="Press Enter or comma to add a language."
                    />
                    <TagField
                        id="profile-interests"
                        label="Interests"
                        values={formik.values.interests}
                        onChange={(values) =>
                            formik.setFieldValue("interests", values, true)
                        }
                        placeholder="e.g. Mindfulness"
                        maxItems={20}
                        itemMaxLength={60}
                        error={
                            formik.touched.interests &&
                            formik.errors.interests
                        }
                        hint="Topics you focus on or care about."
                    />
                </div>
            </FormSection>

            <FormSection
                icon={<FiLink aria-hidden="true" />}
                title="Social links"
                description="Let patients find you elsewhere. Leave any field empty to hide it."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    {SOCIAL_INPUTS.map((field) => (
                        <Input
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            type="url"
                            value={formik.values[field.name]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched[field.name] &&
                                formik.errors[field.name]
                            }
                            placeholder={field.placeholder}
                        />
                    ))}
                </div>
            </FormSection>

            {isDoctor && (
                <FormSection
                    icon={<FiBriefcase aria-hidden="true" />}
                    title="Practice details"
                    description="These details appear in the practice panel on your public profile."
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Professional title"
                            name="professionalTitle"
                            value={formik.values.professionalTitle}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.professionalTitle &&
                                formik.errors.professionalTitle
                            }
                            placeholder="Consultant Clinical Psychologist"
                        />
                        <Input
                            label="Clinic name"
                            name="clinicName"
                            value={formik.values.clinicName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.clinicName &&
                                formik.errors.clinicName
                            }
                            placeholder="Nexus Psychology Clinic"
                        />
                        <Select
                            label="Specialization"
                            name="specialization"
                            value={formik.values.specialization}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.specialization &&
                                formik.errors.specialization
                            }
                            required
                        >
                            <option value="" disabled>
                                Select specialization
                            </option>
                            {SPECIALIZATIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        <Input
                            label="Years of experience"
                            name="yearsOfExperience"
                            type="number"
                            min="0"
                            max="70"
                            inputMode="numeric"
                            value={formik.values.yearsOfExperience}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.yearsOfExperience &&
                                formik.errors.yearsOfExperience
                            }
                            placeholder="8"
                        />
                        <Input
                            label="Session fee (EGP)"
                            name="sessionFees"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={formik.values.sessionFees}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.sessionFees &&
                                formik.errors.sessionFees
                            }
                            required
                        />
                        <Input
                            label="Practice location"
                            name="location"
                            value={formik.values.location}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.location && formik.errors.location}
                            placeholder="New Cairo, Cairo"
                        />
                        <div className="sm:col-span-2">
                            <Textarea
                                label="Professional qualifications summary"
                                name="qualifications"
                                rows={3}
                                value={formik.values.qualifications}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.qualifications &&
                                    formik.errors.qualifications
                                }
                                placeholder="MSc Clinical Psychology, Cairo University (2016)"
                                hint="Older free-text summary. Add structured qualifications from your profile page for a richer list."
                            />
                        </div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:col-span-2">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary mt-0.5"
                                checked={formik.values.isAvailable}
                                onChange={formik.handleChange}
                                name="isAvailable"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-neutral-900">
                                    Available for new appointments
                                </span>
                                <span className="mt-0.5 block text-sm leading-6 text-neutral-600">
                                    Turn this off when your schedule is full.
                                    Patients will still be able to view your
                                    profile.
                                </span>
                            </span>
                        </label>
                    </div>
                </FormSection>
            )}

            <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-base-100/95 p-3 shadow-lg backdrop-blur">
                <p className="text-sm text-neutral-600">
                    {formik.dirty
                        ? "You have unsaved changes."
                        : "All changes are saved."}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button
                        as={Link}
                        to="/profile"
                        variant="outline"
                        disabled={formik.isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={formik.isSubmitting}
                        loadingText="Saving…"
                    >
                        <FiSave aria-hidden="true" /> Save profile
                    </Button>
                </div>
            </div>
        </form>
    );
};

export function ProfileEditor() {
    const { userProfileData, isLoading, error, refreshProfile } =
        useUserProfile();

    if (isLoading && !userProfileData) return <EditorSkeleton />;

    if (error && !userProfileData) {
        return (
            <ErrorState
                title="We couldn't load your profile"
                message={getApiErrorMessage(
                    error,
                    "Check your connection and try again."
                )}
                onRetry={refreshProfile}
            />
        );
    }

    if (!userProfileData) {
        return (
            <ErrorState
                title="Profile unavailable"
                message="Your profile could not be found. Try signing in again."
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto w-full max-w-4xl"
        >
            <ProfileEditorForm profile={userProfileData} />
        </motion.div>
    );
}
