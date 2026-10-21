import { LoginForm } from "../components/form/LoginForm";
import { CustomToast } from "../components/ui/CustomToast";
import { BsHeartPulseFill } from "react-icons/bs";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const Login = () => (
    <>
        <CustomToast />
        <main className="relative min-h-screen overflow-hidden bg-canvas px-4 py-6 sm:px-8 lg:grid lg:min-h-screen lg:grid-cols-2 lg:gap-0 lg:p-0">
            <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-900 px-10 py-10 text-white lg:flex xl:px-16">
                <div className="absolute -right-28 top-24 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -right-12 top-40 h-64 w-64 rounded-full border border-white/10" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/20">
                        <BsHeartPulseFill />
                    </div>
                    <span className="text-xl font-bold tracking-wide">Nexus</span>
                </div>
                <div className="relative z-10 mx-auto w-full max-w-xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Care, connected</p>
                    <h1 className="max-w-lg text-4xl font-bold leading-tight xl:text-5xl">A calmer way to manage your practice.</h1>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-200">Bring appointments, schedules, and your professional community together in one focused workspace.</p>
                    <img
                        src={`${imagesDir}/loginPhoto.png`}
                        className="mx-auto mt-8 max-h-[min(38vh,360px)] w-full max-w-md object-contain drop-shadow-2xl"
                        alt="Illustration of connected healthcare"
                    />
                </div>
                <p className="relative z-10 text-sm text-slate-300">Nexus</p>
            </section>
            <section className="relative flex min-h-[calc(100vh-3rem)] items-center justify-center py-6 lg:min-h-screen lg:px-8 lg:py-12">
                <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-base-100 p-6 shadow-xl shadow-slate-900/5 sm:p-9 lg:p-10">
                    <div className="mb-8 lg:hidden">
                        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-xl text-white shadow-md shadow-primary/20"><BsHeartPulseFill /></div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Nexus</p>
                    </div>
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-primary">Welcome back</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Sign in to your account</h2>
                        <p className="mt-2 text-base leading-relaxed text-neutral-600">Access your appointments, schedule, and community.</p>
                    </div>
                    <LoginForm />
                </div>
            </section>
        </main>
    </>
);
