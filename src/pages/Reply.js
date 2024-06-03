import { useState } from "react";
import { CustomDeletionModal } from "../components/ui/CustomDeletionModal";
import { useDeleteReply } from "../api/comments/deletReply";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineDoneOutline } from "react-icons/md";
import { useUpdateReply } from "../api/comments/putReply";
import toast from "react-hot-toast";
import { useAuth } from "../auth/authProvider";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const Reply = ({
    id = -1,
    content = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam accusamus natus mollitia voluptatibus consectetur aliquid, impedit qui assumenda incidunt officia!",
    repliedAt = "5 hours ago",
    username = "John Doe",
    authorId = "author-1",
    commentId = -1,
    postId = -1,
    handleDeleteReply,
    image,
}) => {
    const [replyText, setReplyText] = useState(content);
    const [isEditing, setIsEditing] = useState(false);
    const [tempReplyText, setTempReplyText] = useState(content);

    const { userData } = useAuth();

    const handleReplyChange = (e) => {
        setTempReplyText(e.target.value);
    };

    const {
        isLoading: replyDeletionLoading,
        error: replyDeletionError,
        data: replyDeletionData,
        execute: deleteReplyExecute,
    } = useDeleteReply();
    const {
        isLoading: replyUpdateLoading,
        error: replyUpdateError,
        data: replyUpdateData,
        execute: UpdateReplyExecute,
    } = useUpdateReply();

    const toggleEdit = () => {
        if (isEditing) {
            setTempReplyText(replyText);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveEdit = async () => {
        debugger;
        try {
            debugger;
            await UpdateReplyExecute(postId, commentId, id, tempReplyText);
            setReplyText(tempReplyText);
            setIsEditing(false);
        } catch (error) {
            toast.error(error.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };

    const handleDelete = async () => {
        await deleteReplyExecute(postId, commentId, id);
        await handleDeleteReply();
    };

    return (
        <div className="flex flex-col shadow-md rounded-lg mt-3 w-full p-2 md:p-4 border-base-300 border-2">
            <div className="info flex flex-row">
                <div className="flex flex-row flex-grow">
                    <img
                        className="w-8 h-8 md:w-16 md:h-16 rounded-2xl shadow-lg"
                        src={image || imagesDir + "/profile.webp"}
                        alt="Author"
                    />
                    <div className="ml-4 flex flex-col justify-center w-full">
                        <h1 className="text-md md:text-xl text-secondary font-bold">
                            {username}
                        </h1>
                        <p className="text-xs md:text-md text-info">
                            {repliedAt}
                        </p>
                        <div className="my-1 w-full">
                            {isEditing ? (
                                <div className="flex flex-row items-center gap-2 md:text-xl">
                                    <input
                                        type="text"
                                        value={tempReplyText}
                                        onChange={handleReplyChange}
                                        className="input input-bordered w-full"
                                    />
                                    <button onClick={handleSaveEdit}>
                                        <MdOutlineDoneOutline className="text-success" />
                                    </button>
                                    <button onClick={toggleEdit}>
                                        <IoIosCloseCircleOutline className="text-error" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm md:text-lg w-full break-all">
                                    {replyText}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="actions flex flex-row mt-2">
                        {userData?.userId === authorId && (
                            <>
                                {!isEditing && (
                                    <button
                                        className="btn btn-xs md:btn-sm btn-secondary btn-outline text-md"
                                        onClick={toggleEdit}
                                    >
                                        {replyUpdateLoading ? (
                                            <span className="loading loading-spinner text-primary"></span>
                                        ) : (
                                            <FaEdit />
                                        )}
                                    </button>
                                )}
                                <button
                                    className="btn btn-xs md:btn-sm ml-2 btn-error text-white text-md"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                "delete-reply-modal-" + id
                                            )
                                            .showModal()
                                    }
                                >
                                    {replyDeletionLoading ? (
                                        <span className="loading loading-spinner text-primary"></span>
                                    ) : (
                                        <RiDeleteBin5Line />
                                    )}
                                </button>
                                <CustomDeletionModal
                                    id={"delete-reply-modal-" + id}
                                    handleConfirm={handleDelete}
                                    loading={replyDeletionLoading}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
