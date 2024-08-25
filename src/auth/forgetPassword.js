import { CustomToast } from "../components/ui/CustomToast";
import ResetPasswordForm from "../components/form/ResetPasswordForm";
const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const ResetPassword = () => (
    <>
        <CustomToast />
        <div className="flex flex-row h-screen justify-center">
            <div className="p-16 hidden md:flex relative animated-gradient justify-center items-center">
                <img
                    src={imagesDir + "/resetPasswordPhoto.png"}
                    className="w-full p-8"
                    alt="Reset Password"
                />
            </div>
            <div className="flex-row p-8 justify-center max-w-lg">
                <div className="welcome-text py-8">
                    <h3 className="text-secondary mb-4 text-3xl font-bold">
                        Create a New Password
                    </h3>
                    <p className="text-info">
                        Please enter your new password below. Make sure it's
                        strong and something you'll remember.
                    </p>
                </div>
                <ResetPasswordForm />
            </div>
        </div>
    </>
);
