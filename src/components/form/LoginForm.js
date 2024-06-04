import { Formik, Form, Field, ErrorMessage } from "formik";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // import eye icons
import { useAuth } from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "../../api/auth/signIn";
import { useState } from "react"; // import useState
import { useUserProfile } from "../../context/profileContext";

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

export const LoginForm = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();
    const { isLoading, error, execute } = useSignIn();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // state for password visibility
    const { initializeUserProfile } = useUserProfile();

    const handleTogglePasswordVisibility = () => {
        setIsPasswordVisible((prevState) => !prevState);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            debugger;
            const data = await execute(values);
            setToken(data.token);
            initializeUserProfile(data.token);
            navigate("/", { replace: true });
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
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
                    <div className="actions flex justify-between w-full my-3 px-3">
                        <label className="cursor-pointer flex items-center">
                            <Field
                                type="checkbox"
                                name="rememberMe"
                                className="checkbox border-2 checkbox-info checkbox-sm rounded-md mr-3 checked:checkbox-primary"
                            />
                            <span className="label-text font-semibold text-info">
                                Remember me
                            </span>
                        </label>
                        <a
                            className="text-primary font-semibold text-sm"
                            href="#"
                        >
                            Forget Your Password
                        </a>
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
    );
};
