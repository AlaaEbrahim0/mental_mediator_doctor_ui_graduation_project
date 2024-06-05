// src/ui/Notification.js
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/notificationsContext";

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

    const handleMarkAsRead = async () => {
        debugger;
        if (isRead) return;
        markAsRead(id);
    };
    return (
        <Link
            key={resources.postId}
            className="w-full"
            to={`forums/${resources.postId}`}
            onClick={handleMarkAsRead}
        >
            <div
                className={`flex flex-col py-4 px-4 rounded-lg ${
                    isRead ? "" : "bg-base-100"
                }`}
            >
                <div className="flex flex-row gap-x-4">
                    <img
                        src={notifierPhotoUrl}
                        className="w-12 h-12 rounded-full"
                        alt={notifierUserName}
                    />
                    <div className="flex flex-col justify-center">
                        <div className="text-md font-semibold">
                            {notifierUserName} {message}
                        </div>
                        <div className="text-sm text-gray-500">
                            {dateCreated}
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
        </Link>
    );
};
