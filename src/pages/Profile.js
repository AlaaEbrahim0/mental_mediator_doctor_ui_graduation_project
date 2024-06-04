import { useEffect, useState } from "react";
import { useGetProfile } from "../api/getProfile";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateProfile } from "../api/updateProfile";
import { useUserProfile } from "../context/profileContext";
import toast from "react-hot-toast";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export function Profile() {
    // const {
    //     isLoading,
    //     error: profileError,
    //     data: profileData,
    //     execute,
    // } = useGetProfile();

    // const {
    //     isLoading: updateLoading,
    //     error: updateError,
    //     execute: updateProfile,
    // } = useUpdateProfile();

    const {
        isLoading,
        userProfileData: profileData,
        updateUserProfile: updateProfile,
        updateLoading,
    } = useUserProfile();

    console.log(profileData);

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
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await updateProfile(values);
                toast.success("Profile updated successfully!");
                console.log("Profile updated successfully!");
            } catch (error) {
                console.error("Error updating profile:", error);
            }
        },
    });
    useEffect(() => {
        if (profileData) {
            formik.setValues({
                ...formik.initialValues,
                ...profileData,
                photo: null, // Reset photo to prevent overwriting with initial profile photo URL
            });
            setPhotoPreview(
                profileData.photoUrl || `${imagesDir}/profile.webp`
            );
        }
    }, [profileData]); // Only re-run the effect if profileData changes

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
        <>
            {isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : (
                <form
                    onSubmit={formik.handleSubmit}
                    className="flex justify-center form-border-gradient shadow-md p-4 glass rounded-lg max-w-xl mt-4 mx-auto  mb-8"
                >
                    <div className="grid grid-cols-2 gap-x-4 w-full">
                        <div
                            className="col-span-2 w-full"
                            onClick={handlePhotoClick}
                        >
                            <img
                                src={photoPreview}
                                className="w-32 h-32 mb-2 object-cover mx-auto rounded-full cursor-pointer"
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
                                <div className="text-error mt-1 text-xs md:text-md">
                                    {formik.errors.photo}
                                </div>
                            ) : null}
                        </div>
                        <label className="form-control w-full max-w-lg">
                            <div className="label">
                                <span className="label-text text-lg ">
                                    First Name
                                </span>
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                className="input input-bordered hover:input-primary focus-within:input-primary w-full max-w-lg"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.firstName &&
                            formik.errors.firstName ? (
                                <div className="text-error mt-1 text-xs md:text-md">
                                    {formik.errors.firstName}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control w-full max-w-lg">
                            <div className="label">
                                <span className="label-text text-lg ">
                                    Last Name
                                </span>
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                className="input input-bordered hover:input-primary focus-within:input-primary w-full max-w-lg"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.lastName &&
                            formik.errors.lastName ? (
                                <div className="text-error mt-1 text-xs md:text-md">
                                    {formik.errors.lastName}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-lg ">
                                    Email
                                </span>
                            </div>
                            <input
                                type="text"
                                name="email"
                                disabled
                                className="input input-bordered hover:input-primary focus-within:input-primary w-full"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-lg ">
                                    Biography
                                </span>
                            </div>
                            <textarea
                                name="biography"
                                rows="3"
                                className="textarea textarea-bordered hover:textarea-primary focus-within:textarea-primary w-full"
                                value={formik.values.biography}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </label>
                        <label className="form-control w-full max-w-lg">
                            <div className="label">
                                <span className="label-text text-lg ">
                                    Gender
                                </span>
                            </div>
                            <select
                                name="gender"
                                className="select select-md select-bordered hover:select-primary focus-within:select-primary"
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
                                <div className="text-error mt-1 text-xs md:text-md">
                                    {formik.errors.gender}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control w-full max-w-lg">
                            <div className="label">
                                <span className="label-text text-lg ">
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
                                className="input  input-bordered hover:input-primary focus-within:input-primary w-full max-w-lg"
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
                                <div className="text-error mt-1 text-xs md:text-md">
                                    {formik.errors.birthDate}
                                </div>
                            ) : null}
                        </label>
                        <label className="form-control col-span-2 w-full">
                            <div className="label">
                                <span className="label-text text-lg ">
                                    Specialization
                                </span>
                            </div>
                            <select
                                name="specialization"
                                className="select select-bordered hover:select-primary focus-within:select-primary select- w-full"
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
                        <button
                            type="submit"
                            className="btn btn-primary btn-outline hover:btn-secondary col-span-2 my-4"
                            disabled={formik.isSubmitting}
                        >
                            Update
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}
