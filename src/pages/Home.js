import { MainLayout } from "../components/layout/MainLayout";
import toast from "react-hot-toast";
export function Home() {
    return (
        <div className="grid grid-cols-4 gap-4 ">
            <div className="p-5 text-4xl font-bold bg-primary">01</div>
            <div className="p-5 text-4xl font-bold bg-primary">02</div>
            <div className="p-5 text-4xl font-bold bg-primary">03</div>
            <div className="p-5 text-4xl font-bold bg-primary">04</div>
            <div className="p-5 text-4xl font-bold bg-primary">05</div>
            <div className="p-5 text-4xl font-bold bg-primary">06</div>
            <div className="p-5 text-4xl font-bold bg-primary">07</div>
            <div className="p-5 text-4xl font-bold bg-primary">08</div>
            <div className="p-5 text-4xl font-bold bg-primary">09</div>
        </div>
    );
}
export function Appointments() {
    return (
        <div className="grid grid-cols-4 gap-4">
            <div>01</div>
            <div>02</div>
            <div>03</div>
            <div>04</div>
            <div>05</div>
            <div>06</div>
            <div>07</div>
            <div>08</div>
            <div>09</div>
        </div>
    );
}
