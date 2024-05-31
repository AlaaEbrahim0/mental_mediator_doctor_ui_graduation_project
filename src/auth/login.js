import { LoginForm } from "../components/form/LoginForm";

export const Login = () => (
    <div className="flex h-screen overflow-hidden">
        <div className="flex-1 p-16 flex relative animated-gradient justify-center items-center">
            <img
                src="images/loginPhoto.png"
                className="w-full p-8"
                alt="Login"
            />
        </div>
        <div className="flex-1 flex-col p-8  max-w-lg">
            <div className="welcome-text py-8">
                <h3 className="text-secondary text-xl font-bold">
                    Login To Your Account
                </h3>
                <p className="text-info">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Numquam, cumque praesentium nemo necessitatibus expedita
                    odio amet unde aut molestias neque.
                </p>
            </div>
            <LoginForm />
        </div>
    </div>
);
