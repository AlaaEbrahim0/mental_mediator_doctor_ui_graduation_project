import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useAuth } from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "../../api/auth/signIn";
import { useState } from "react";
import { useUserProfile } from "../../context/profileContext";
import { useForgetPassword } from "../../api/auth/forgetPassword.js";
import toast from "react-hot-toast";

const validate = (values) => {
    const errors = {};

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Invalid email address";
    }

    if (!values.password) {
        errors.password = "Password is required";
    } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    }

    return errors;
};

const FormField = ({
    label,
    name,
    type,
    icon,
    placeholder,
    error,
    touched,
    onToggleVisibility,
    isPasswordVisible,
}) => (
    <label className="form-control w-full">
        <div className="label">
            <span className="text-lg font-semibold text-secondary">
                {label}
            </span>
        </div>
        <label className="input input-bordered border-info border-2 input-info outline-none rounded-md flex items-center gap-2 focus-within:border-primary focus-within:ring-none focus-within:outline-none">
            {icon}
            <Field
                type={type}
                name={name}
                className="grow"
                placeholder={placeholder}
            />
            {name === "password" && (
                <span onClick={onToggleVisibility} className="cursor-pointer">
                    {isPasswordVisible ? (
                        <AiFillEyeInvisible className="text-secondary text-2xl" />
                    ) : (
                        <AiFillEye className="text-secondary text-2xl" />
                    )}
                </span>
            )}
        </label>
        <ErrorMessage name={name} component="div" className="text-red-500" />
    </label>
);

const ForgetPasswordModal = ({ isOpen, onRequestClose, onSubmit }) => {
    const [message, setMessage] = useState("");
    return (
        <ForgetPasswordCustomModal isOpen={isOpen} onClose={onRequestClose}>
            <h2 className="text-lg font-semibold mb-4">Forget Password</h2>
            <Formik
                initialValues={{ email: "" }}
                validate={(values) => {
                    const errors = {};
                    if (!values.email) {
                        errors.email = "Email is required";
                    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
                        errors.email = "Invalid email address";
                    }
                    return errors;
                }}
                onSubmit={onSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="flex flex-col gap-y-3">
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            icon={
                                <MdOutlineMailOutline className="text-secondary text-2xl mr-1" />
                            }
                            placeholder="ex@example.com"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary text-lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                "Send"
                            )}
                        </button>
                        <p className="text-success">{message}</p>
                    </Form>
                )}
            </Formik>
        </ForgetPasswordCustomModal>
    );
};

export const LoginForm = () => {
    const { setToken, setUserId } = useAuth();
    const navigate = useNavigate();
    const { isLoading, error, execute } = useSignIn();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { initializeUserProfile } = useUserProfile();
    const [isForgetPasswordOpen, setIsForgetPasswordOpen] = useState(false);
    const { execute: executeForgetPassword } = useForgetPassword();

    const handleTogglePasswordVisibility = () => {
        setIsPasswordVisible((prevState) => !prevState);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const data = await execute(values);
            setToken(data.token);
            setUserId(data.userId);
            debugger;
            await initializeUserProfile();
            navigate("/", { replace: true });
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleForgetPasswordSubmit = async (values, { setSubmitting }) => {
        try {
            await executeForgetPassword(values.email);
            toast.success("Password reset link sent to your email");

            // setIsForgetPasswordOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to send password reset link");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Formik
                initialValues={{ email: "", password: "", rememberMe: false }}
                validate={validate}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form className="login-form flex flex-col gap-y-3 ">
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            icon={
                                <MdOutlineMailOutline className="text-secondary text-2xl mr-1" />
                            }
                            placeholder="ex@example.com"
                            error={errors.email}
                            touched={touched.email}
                        />
                        <FormField
                            label="Password"
                            name="password"
                            type={isPasswordVisible ? "text" : "password"}
                            icon={
                                <RiLockPasswordLine className="text-secondary text-2xl mr-1" />
                            }
                            placeholder="********"
                            error={errors.password}
                            touched={touched.password}
                            onToggleVisibility={handleTogglePasswordVisibility}
                            isPasswordVisible={isPasswordVisible}
                        />
                        <div className="actions flex justify-end w-full my-3 px-3">
                            <button
                                className="text-primary font-semibold text-sm"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsForgetPasswordOpen(true);
                                }}
                            >
                                Forgot your password?
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary text-lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting || isLoading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                "Login"
                            )}
                        </button>
                        <ul className="text-error">
                            {error?.errors.map((error) => (
                                <li key={error.code}>{error.description}</li>
                            ))}
                        </ul>
                    </Form>
                )}
            </Formik>
            <ForgetPasswordModal
                isOpen={isForgetPasswordOpen}
                onRequestClose={() => setIsForgetPasswordOpen(false)}
                onSubmit={handleForgetPasswordSubmit}
            />
        </>
    );
};

const ForgetPasswordCustomModal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-600"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};
