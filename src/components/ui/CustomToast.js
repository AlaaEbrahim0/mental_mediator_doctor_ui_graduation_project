import React from "react";
import { MdOutlineDoneOutline } from "react-icons/md";
import { MdOutlineErrorOutline } from "react-icons/md";
import { Toaster } from "react-hot-toast";

export const CustomToast = () => {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                style: {
                    fontSize: "16px",
                    borderRadius: "8px",
                },
                success: {
                    position: "top-center",
                    duration: 3000,
                    icon: (
                        <div>
                            <MdOutlineDoneOutline />
                        </div>
                    ),
                    style: {
                        color: "#48DAB3",
                        background: "#fff",
                        boxShadow: "0 0 10px #48DAB3",
                    },
                },
                error: {
                    duration: 3000,
                    icon: (
                        <div className="text-white text-2xl">
                            <MdOutlineErrorOutline />
                        </div>
                    ),
                    style: {
                        background: "#ec4f5f",
                        color: "#fff",
                        width: "300px",
                        borderRadius: "4px",
                    },
                },
            }}
        />
    );
};
