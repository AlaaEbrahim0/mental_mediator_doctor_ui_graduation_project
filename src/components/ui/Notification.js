import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/notificationsContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";
import toast from "react-hot-toast";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const Notification = ({
    id,
    message,
    notifierUserName,
    notifierPhotoUrl,
    dateCreated,
    resources,
    type,
    isRead,
}) => {
    const { markAsRead } = useNotifications();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleMarkAsRead = async (event) => {
        event.preventDefault();
        try {
            await markAsRead(id);
            if (resources["postId"]) {
                navigate(
                    `forums/${resources.postId}#comment-${resources.commentId}`
                );
            }
            if (resources["appointmentId"]) {
                navigate(`appointments`);
            }
        } catch (err) {
            console.error("Navigation error:", err);
            setError(
                "The page you're trying to navigate to was not found or deleted."
            );
            toast.error(error);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
                onClick={handleMarkAsRead}
            >
                <div
                    className={`flex flex-col py-4 px-4 rounded-lg ${
                        isRead ? "" : "bg-base-100 glass"
                    }`}
                >
                    <div className="flex flex-row gap-x-4">
                        <img
                            src={
                                notifierPhotoUrl || imagesDir + "/profile.webp"
                            }
                            className="w-12 h-12 rounded-full"
                            alt={notifierUserName}
                        />
                        <div className="flex flex-col justify-center">
                            <div className="text-md font-semibold">
                                {message}
                            </div>
                            <div className="text-sm text-gray-500">
                                {convertUtcToRelativeTime(dateCreated)}
                            </div>
                        </div>
                    </div>
                    {type === "appointmentRequest" && (
                        <div className="flex flex-row gap-4">
                            <button className="btn btn-sm btn-outline">
                                Accept
                            </button>
                            <button className="btn btn-sm btn-outline btn-error">
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};
