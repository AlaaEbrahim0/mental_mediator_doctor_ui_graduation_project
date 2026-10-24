import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useAuth } from "../../auth/authProvider";
import { saveSession } from "../../auth/session";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForgetPassword, useSignIn } from "../../api/auth.api";
import toast from "react-hot-toast";
import { FiKey } from "react-icons/fi";

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
    idPrefix = "login",
}) => (
    <div className="form-control w-full">
        <div className="label">
            <label htmlFor={`${idPrefix}-${name}`} className="text-sm font-semibold text-neutral-800">
                {label}
            </label>
        </div>
        <div className={`input input-bordered flex h-12 items-center gap-3 rounded-xl border bg-base-100 px-3 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${error && touched ? "border-error" : "border-neutral-300"}`}>
            <span aria-hidden="true" className="text-xl text-neutral-600">{icon}</span>
            <Field
                id={`${idPrefix}-${name}`}
                type={type}
                name={name}
                className="min-w-0 grow bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500"
                placeholder={placeholder}
                aria-invalid={Boolean(error && touched)}
            />
            {name === "password" && (
                <button type="button" onClick={onToggleVisibility} className="rounded-md p-1 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                    {isPasswordVisible ? (
                        <AiFillEyeInvisible className="text-xl" />
                    ) : (
                        <AiFillEye className="text-xl" />
                    )}
                </button>
            )}
        </div>
        <ErrorMessage name={name} component="div" className="mt-1.5 text-sm font-medium text-red-700" />
    </div>
);

const ForgetPasswordModal = ({ isOpen, onRequestClose, onSubmit }) => {
    return (
        <ForgetPasswordCustomModal isOpen={isOpen} onClose={onRequestClose}>
            <h2 id="password-reset-title" className="mb-4 text-lg font-semibold text-neutral-900">Reset your password</h2>
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
                            idPrefix="reset"
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
                    </Form>
                )}
            </Formik>
        </ForgetPasswordCustomModal>
    );
};

export const LoginForm = () => {
    const { setToken, setUserId, setRoles, setExpiresOn } = useAuth();
    const navigate = useNavigate();
    const { isLoading, errorMessages, execute } = useSignIn();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isForgetPasswordOpen, setIsForgetPasswordOpen] = useState(false);
    const { execute: executeForgetPassword } = useForgetPassword();

    const handleTogglePasswordVisibility = () => {
        setIsPasswordVisible((prevState) => !prevState);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const data = await execute(values);
            // API requests and the SignalR token factory read from the shared
            // session helpers, so persist before navigating to make sure the
            // first request after login already carries the token.
            saveSession({
                token: data.token,
                userId: data.userId,
                roles: data.roles || [],
                expiresOn: data.expiresOn || null,
            });
            setToken(data.token);
            setUserId(data.userId);
            setRoles(data.roles || []);
            setExpiresOn(data.expiresOn || null);
            // The profile provider loads the doctor profile when the auth token
            // changes. Let it own that request so login doesn't issue a second
            // /doctors/me call before the auth state has propagated.
            navigate("/", { replace: true });
        } catch (requestError) {
            console.error("Sign-in failed:", requestError);
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
                {({ isSubmitting, errors, touched, setValues }) => (
                    <Form className="login-form flex flex-col gap-y-4">
                        <aside className="rounded-xl border border-primary-200 bg-primary-50/70 p-3.5 sm:p-4" role="note" aria-label="Recruiter demo account">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-base-100 text-primary-800 shadow-sm">
                                    <FiKey aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-bold text-neutral-900">Recruiter demo access</h3>
                                    <p className="mt-0.5 text-xs leading-5 text-neutral-700">Use this demo account to explore the Nexus workspace.</p>
                                </div>
                            </div>
                            <dl className="mt-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs sm:text-sm">
                                <dt className="font-semibold text-neutral-600">Email</dt>
                                <dd className="min-w-0 break-all font-mono font-medium text-neutral-900">doctor@example.com</dd>
                                <dt className="font-semibold text-neutral-600">Password</dt>
                                <dd className="min-w-0 break-all font-mono font-medium text-neutral-900">Password1!</dd>
                            </dl>
                            <button
                                type="button"
                                onClick={() => setValues((values) => ({ ...values, email: "doctor@example.com", password: "Password1!" }))}
                                className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-primary-700/20 bg-base-100 px-3 text-xs font-semibold text-primary-900 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 sm:text-sm"
                            >
                                Fill sign-in details
                            </button>
                        </aside>
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
                                type="button"
                                className="rounded-md text-sm font-semibold text-primary-700 transition-colors hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                            className="btn btn-primary mt-1 min-h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                "Login"
                            )}
                        </button>
                        {errorMessages.length > 0 && (
                            <div
                                role="alert"
                                aria-live="polite"
                                className="rounded-xl border border-error/30 bg-error/5 px-3.5 py-3"
                            >
                                <p className="text-sm font-semibold text-red-800">
                                    We could not sign you in
                                </p>
                                <ul className="mt-1 space-y-1 text-sm font-medium text-red-700">
                                    {errorMessages.map((message, index) => (
                                        <li key={`${message}-${index}`}>{message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
        const previousOverflow = document.body.style.overflow;
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-slate-950/55 p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="password-reset-title" className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-base-100 p-6 shadow-2xl">
                <button
                    type="button"
                    aria-label="Close password reset"
                    className="absolute right-3 top-3 rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};
