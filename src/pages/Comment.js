import React, { useState, useRef } from "react";
import { Reply } from "./Reply";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import { useGetReplies } from "../api/getReplies";
import { CustomDeletionModal } from "../components/ui/CustomDeletionModal";
import { useCreateReply } from "../api/postReply";
import { useUpdateComment } from "../api/comments/putComment";
import { useDeleteComment } from "../api/comments/deleteComment";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineDoneOutline } from "react-icons/md";
import { useAuth } from "../auth/authProvider";
import { BiMessageAltAdd } from "react-icons/bi";
import toast from "react-hot-toast";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const Comment = ({
    id = -1,
    content = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam accusamus natus mollitia voluptatibus consectetur aliquid, impedit qui assumenda incidunt officia!",
    commentedAt = "5 hours ago",
    authorName = "John Doe",
    authorId = "author-1",
    postId = -1,
    photoUrl,
    handleDeleteComment,
    handleCommentDeletion, // New prop for handling comment deletion
}) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [commentText, setCommentText] = useState(content);
    const [tempCommentText, setTempCommentText] = useState(content);
    const addReplyRef = useRef(null);

    const { userData } = useAuth();

    const {
        isLoading: commentDeletionLoading,
        error: commentDeletionError,
        data: commentDeletionData,
        execute: deleteCommentExecute,
    } = useDeleteComment();
    const {
        isLoading: commentUpdateLoading,
        error: commentUpdateError,
        data: commentUpdateData,
        execute: UpdateCommentExecute,
    } = useUpdateComment();
    const {
        isLoading: isRepliesLoading,
        error: repliesError,
        data: repliesData,
        execute: getRepliesExecute,
    } = useGetReplies();
    const {
        isLoading: isCreateLoading,
        error: createReplyError,
        execute: createReplyExecute,
    } = useCreateReply();

    if (repliesError) {
        return <div>Error loading replies</div>;
    }
    if (createReplyError) {
        // Handle create reply error
    }

    const handleReplyChange = (e) => {
        setReplyText(e.target.value);
    };

    const handleAddReply = async () => {
        try {
            await createReplyExecute(postId, id, replyText);
            setReplyText("");
            await getRepliesExecute(postId, id);
            setShowReplies(true);
        } catch (e) {
            toast.error(e.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            setTempCommentText(commentText);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveEdit = async () => {
        try {
            await UpdateCommentExecute(postId, id, tempCommentText);
            setCommentText(tempCommentText);
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
        await deleteCommentExecute(postId, id);
        await handleDeleteComment();
        handleCommentDeletion(); // Notify parent about the deletion
    };

    const toggleReplies = async () => {
        if (!showReplies) {
            await getRepliesExecute(postId, id);
        }
        setShowReplies(!showReplies);
    };

    const scrollToAddReply = () => {
        setShowReplyInput(true);
        setTimeout(() => {
            const addReplyElement = addReplyRef.current;
            if (addReplyElement) {
                const elementHeight = addReplyElement.clientHeight;
                const windowHeight = window.innerHeight;
                const scrollPosition =
                    addReplyElement.offsetTop -
                    (windowHeight - elementHeight) / 2;

                window.scrollTo({
                    top: scrollPosition,
                    behavior: "smooth",
                });

                addReplyElement.focus();
            }
        }, 100); // Small delay to ensure input is rendered before scrolling
    };

    return (
        <div className="flex flex-col shadow-md rounded-lg mt-3 p-4 glass">
            <div className="info flex flex-row flex-1">
                <div className="flex flex-row flex-grow">
                    <img
                        className="w-16 h-16 object-cover rounded-2xl shadow-lg"
                        src={photoUrl || imagesDir + "/profile.webp"}
                        alt="Author"
                    />
                    <div className="ml-4 flex flex-col justify-center flex-grow">
                        <h1 className="text-xl text-secondary font-bold">
                            {authorName}
                        </h1>
                        <p className="text-info">{commentedAt}</p>

                        <div className="my-1">
                            {isEditing ? (
                                <div className="flex flex-row items-center gap-2 text-xl">
                                    <input
                                        type="text"
                                        value={tempCommentText}
                                        onChange={(e) =>
                                            setTempCommentText(e.target.value)
                                        }
                                        className="input input-bordered w-full"
                                        disabled={
                                            commentDeletionLoading ||
                                            commentUpdateLoading
                                        }
                                    />
                                    <button onClick={handleSaveEdit}>
                                        <MdOutlineDoneOutline className="text-success" />
                                    </button>
                                    <button onClick={toggleEdit}>
                                        <IoIosCloseCircleOutline className="text-error" />
                                    </button>
                                </div>
                            ) : (
                                <p>{commentText}</p>
                            )}
                        </div>
                        <div>
                            <div className="actions flex flex-row gap-x-2 mt-2">
                                <></>
                                <button
                                    className="btn btn-sm btn-secondary btn-outline text-md"
                                    onClick={toggleReplies}
                                    disabled={isRepliesLoading}
                                >
                                    {isRepliesLoading && (
                                        <span className="loading loading-spinner"></span>
                                    )}
                                    {showReplies
                                        ? "Hide Replies"
                                        : "Show Replies"}
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary btn-outline text-md"
                                    onClick={scrollToAddReply}
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="actions flex">
                        {authorId === userData.userId && (
                            <>
                                <button
                                    className="btn btn-xs md:btn-sm btn-secondary btn-outline"
                                    onClick={toggleEdit}
                                >
                                    {commentUpdateLoading ? (
                                        <span className="loading loading-spinner text-primary"></span>
                                    ) : (
                                        <FaEdit />
                                    )}
                                </button>
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
                                    <RiDeleteBin5Line />
                                </button>
                            </>
                        )}

                        <CustomDeletionModal
                            id={"delete-reply-modal-" + id}
                            handleConfirm={handleDelete}
                            loading={commentDeletionLoading}
                        />
                    </div>
                </div>
            </div>
            {showReplies && (
                <div className="mt-4">
                    {repliesData &&
                        repliesData.map((reply) => (
                            <Reply
                                key={"reply-" + reply.id}
                                id={reply.id}
                                content={reply.content}
                                username={reply.username}
                                authorId={reply.appUserId}
                                repliedAt={convertUtcToRelativeTime(
                                    reply.repliedAt
                                )}
                                commentId={id}
                                postId={postId}
                                handleDeleteReply={async () =>
                                    await getRepliesExecute(postId, id)
                                }
                                image={reply.photoUrl}
                            />
                        ))}
                </div>
            )}

            {showReplyInput && (
                <div className="mt-4">
                    <input
                        ref={addReplyRef}
                        value={replyText}
                        onChange={handleReplyChange}
                        placeholder="Write your reply..."
                        className="input input-bordered w-full"
                        disabled={isCreateLoading}
                    />
                    <button
                        className="btn btn-sm btn-primary btn-outline mt-3 text-md max-w-52"
                        onClick={handleAddReply}
                        disabled={isCreateLoading || !replyText}
                    >
                        {isCreateLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <BiMessageAltAdd className="text-2xl" />
                        )}
                        Reply
                    </button>
                </div>
            )}
        </div>
    );
};
