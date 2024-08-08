import { LoginForm } from "../components/form/LoginForm";
import { CustomToast } from "../components/ui/CustomToast";
const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;
export const Login = () => (
    <>
        <CustomToast />
        <div className="flex flex-row h-screen justify-center">
            <div className="p-16 hidden md:flex relative animated-gradient justify-center items-center">
                <img
                    src={imagesDir + "/loginPhoto.png"}
                    className="w-full p-8"
                    alt="Login"
                />
            </div>
            <div className="flex-row p-8 justify-center max-w-lg">
                <div className="welcome-text py-8">
                    <h3 className="text-secondary mb-4 text-3xl font-bold">
                        Login To Your Account
                    </h3>
                    <p className="text-info">
                        Lorem ipsum, dolor sit amet consectetur adipisicing
                        elit. Numquam, cumque praesentium nemo necessitatibus
                        expedita odio amet unde aut molestias neque.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    </>
);
