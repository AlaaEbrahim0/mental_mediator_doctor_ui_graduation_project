import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUserProfile } from "../context/profileContext";
import { motion } from "framer-motion";
const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;
const profileInputClass = "input input-bordered mt-1 w-full bg-base-100 text-neutral-900 placeholder:text-neutral-600 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20";
const profileSelectClass = "select select-bordered mt-1 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20";
const profileErrorClass = "mt-1.5 text-sm font-medium text-error";

export function Profile() {
    const {
        isLoading,
        userProfileData: profileData,
        updateUserProfile: updateProfile,
        updateLoading,
    } = useUserProfile();

    const specializationsOptions = [
        { label: "Clinical Psychology", value: "ClinicalPsychology" },
        { label: "Counseling Psychology", value: "CounselingPsychology" },
        { label: "Health Psychology", value: "HealthPsychology" },
        { label: "Neuro Psychology", value: "NeuroPsychology" },
        { label: "Forensic Psychology", value: "ForensicPsychology" },
        { label: "School Psychology", value: "SchoolPsychology" },
        { label: "Social Psychology", value: "SocialPsychology" },
    ];

    const genderOptions = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
    ];

    const validationSchema = Yup.object().shape({
        firstName: Yup.string()
            .min(2, "First name must be between 2 and 64 characters")
            .max(64, "First name must be between 2 and 64 characters")
            .required("First name is required"),
        lastName: Yup.string()
            .min(2, "Last name must be between 2 and 64 characters")
            .max(64, "Last name must be between 2 and 64 characters")
            .required("Last name is required"),
        birthDate: Yup.date()
            .max(new Date(), "Birthdate cannot be in the future")
            .required("Birthdate is required"),
        gender: Yup.string()
            .oneOf(["male", "female"], "Gender must be Male or Female")
            .required("Gender is required"),
        specialization: Yup.string()
            .oneOf([
                "ClinicalPsychology",
                "CounselingPsychology",
                "HealthPsychology",
                "NeuroPsychology",
                "ForensicPsychology",
                "SchoolPsychology",
                "SocialPsychology",
            ])
            .required("Specialization is required"),
        photo: Yup.mixed()
            .notRequired()
            .test("fileSize", "Photo must be less than 5MB", (value) => {
                return value ? value.size <= 5 * 1024 * 1024 : true;
            })
            .test("fileFormat", "Unsupported Format", (value) => {
                return value
                    ? ["image/jpg", "image/jpeg", "image/png"].includes(
                          value.type
                      )
                    : true;
            }),
        location: Yup.string().max(200),
        city: Yup.string().max(100),
        fees: Yup.number().min(0),
        phoneNumber: Yup.string().max(32),
        qualifications: Yup.string().max(2000),
    });

    const [photoPreview, setPhotoPreview] = useState("");

    // useEffect(() => {
    //     execute();
    // }, [execute]);

    const formik = useFormik({
        initialValues: {
            photo: null,
            firstName: profileData?.firstName || "",
            lastName: profileData?.lastName || "",
            birthDate:
                profileData?.birthDate ||
                new Date().toISOString().split("T")[0],
            gender: profileData?.gender || "",
            email: profileData?.email || "",
            specialization: profileData?.specialization || "",
            biography: profileData?.biography || "  ",
            location: profileData?.location || "",
            city: profileData?.city || "",
            fees: profileData?.sessionFees || 0,
            phoneNumber: profileData?.phoneNumber || "",
            qualifications: profileData?.qualifications || "",
            isAvailable: profileData?.isAvailable ?? true,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await updateProfile(values);
            } catch (error) {
                console.error("Error updating profile:", error);
            }
        },
    });
    const { setValues } = formik;
    useEffect(() => {
        if (profileData) {
            setValues((currentValues) => ({
                ...currentValues,
                ...profileData,
                photo: null, // Reset photo to prevent overwriting with initial profile photo URL
            }));
            setPhotoPreview(
                profileData.photoUrl || `${imagesDir}/profile.webp`
            );
        }
    }, [profileData, setValues]);

    const handlePhotoChange = (event) => {
        const file = event.currentTarget.files[0];
        formik.setFieldValue("photo", file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(
                profileData.photoUrl || `${imagesDir}/profile.webp`
            );
        }
    };

    const handlePhotoClick = () => {
        document.getElementById("photo-upload").click();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : (
                <form
                    onSubmit={formik.handleSubmit}
                    className="mx-auto mb-8 mt-4 w-full max-w-3xl rounded-2xl border border-neutral-200 bg-base-100 p-5 shadow-sm sm:p-7"
                >
                    <div className="grid w-full grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                        <div className="col-span-full border-b border-neutral-200 pb-4">
                            <h1 className="text-2xl font-bold text-neutral-900">Profile details</h1>
                            <p className="mt-1 text-sm text-neutral-600">Keep your professional information up to date.</p>
                        </div>
                        <div
                            className="col-span-full w-full cursor-pointer rounded-xl bg-neutral-50 p-4 text-center transition hover:bg-neutral-100"
                            onClick={handlePhotoClick}
                        >
                            <img
                                src={photoPreview}
                                className="mx-auto mb-2 h-24 w-24 rounded-full border-2 border-white object-cover shadow-sm sm:h-28 sm:w-28"
                                alt="Profile"
                            />
                            <input
                                type="file"
                                id="photo-upload"
                                name="photo"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                            {formik.touched.photo && formik.errors.photo ? (
                                <div className={profileErrorClass}>
                                    {formik.errors.photo}
                                </div>
                            ) : null}
                        </div>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    First Name
                                </span>
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                className={profileInputClass}
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.firstName &&
                            formik.errors.firstName ? (
                                <div className={profileErrorClass}>
                                    {formik.errors.firstName}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Last Name
                                </span>
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                className={profileInputClass}
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.lastName &&
                            formik.errors.lastName ? (
                                <div className={profileErrorClass}>
                                    {formik.errors.lastName}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control col-span-full sm:col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Email
                                </span>
                            </div>
                            <input
                                type="text"
                                name="email"
                                disabled
                                className={profileInputClass}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control col-span-full sm:col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Biography
                                </span>
                            </div>
                            <textarea
                                name="biography"
                                rows="3"
                                className="textarea textarea-bordered mt-1 w-full bg-base-100 text-neutral-900 placeholder:text-neutral-600 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                value={formik.values.biography}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control col-span-full sm:col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    City
                                </span>
                            </div>
                            <input
                                type="text"
                                name="city"
                                className={profileInputClass}
                                value={formik.values.city}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control col-span-full sm:col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Location
                                </span>
                            </div>
                            <input
                                type="text"
                                name="location"
                                className={profileInputClass}
                                value={formik.values.location}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Gender
                                </span>
                            </div>
                            <select
                                name="gender"
                                className={profileSelectClass}
                                value={formik.values.gender}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="" disabled>
                                    Gender
                                </option>
                                {genderOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.gender && formik.errors.gender ? (
                                <div className={profileErrorClass}>
                                    {formik.errors.gender}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Birth Date
                                </span>
                            </div>
                            <input
                                type="date"
                                name="birthDate"
                                max={
                                    new Date("2008-01-01")
                                        .toISOString()
                                        .split("T")[0]
                                }
                                className={profileInputClass}
                                value={
                                    new Date(formik.values.birthDate)
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.birthDate &&
                            formik.errors.birthDate ? (
                                <div className={profileErrorClass}>
                                    {formik.errors.birthDate}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control col-span-1 w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Specialization
                                </span>
                            </div>
                            <select
                                name="specialization"
                                className={profileSelectClass}
                                value={formik.values.specialization}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="" disabled>
                                    Specialization
                                </option>
                                {specializationsOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="form-control col-span-1 w-full">
                            <div className="label">
                                <span className="label-text text-sm font-semibold text-neutral-700">
                                    Session Fees
                                </span>
                            </div>
                            <input
                                type="number"
                                name="fees"
                                className={profileInputClass}
                                value={formik.values.fees}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control col-span-1 w-full">
                            <span className="label-text text-sm font-semibold text-neutral-700">Phone</span>
                            <input type="tel" name="phoneNumber" className={profileInputClass} value={formik.values.phoneNumber} onChange={formik.handleChange} />
                        </label>
                        <label className="form-control col-span-1 w-full">
                            <span className="label-text text-sm font-semibold text-neutral-700">Qualifications</span>
                            <textarea name="qualifications" rows={3} className="textarea textarea-bordered mt-1 w-full bg-base-100 text-neutral-900" value={formik.values.qualifications} onChange={formik.handleChange} />
                        </label>
                        <label className="label col-span-full cursor-pointer justify-start gap-3">
                            <input type="checkbox" name="isAvailable" className="checkbox checkbox-primary" checked={formik.values.isAvailable} onChange={formik.handleChange} />
                            <span className="label-text font-semibold">Available for new appointments</span>
                        </label>
                        <button
                            type="submit"
                            className="btn btn-primary col-span-full mt-2 min-h-12 rounded-xl text-base font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            disabled={formik.isSubmitting || updateLoading}
                        >
                            {formik.isSubmitting || updateLoading ? <><span className="loading loading-spinner loading-sm" aria-hidden="true" /> Saving…</> : "Save profile"}
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    );
}
