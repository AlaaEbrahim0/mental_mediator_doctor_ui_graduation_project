import React, { useState, useRef, useEffect } from "react";
import { Reply } from "./Reply";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";
import { useGetReplies } from "../../api/getReplies";
import { BiHide, BiShow, BiMessageAltAdd } from "react-icons/bi";
import { CustomDeletionModal } from "./CustomDeletionModal";
import { useCreateReply } from "../../api/postReply";
import { useUpdateComment } from "../../api/comments/putComment";
import { useDeleteComment } from "../../api/comments/deleteComment";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineDoneOutline } from "react-icons/md";
import { useAuth } from "../../auth/authProvider";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const Comment = ({
    id,
    content,
    commentedAt,
    authorName,
    authorId,
    postId,
    photoUrl,
    repliesCount: initialRepliesCount,
    handleDeleteComment,
    handleCommentDeletion,
    currentUserId,
}) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [commentText, setCommentText] = useState(content);
    const [tempCommentText, setTempCommentText] = useState(content);
    const [repliesCount, setRepliesCount] = useState(initialRepliesCount);

    const addReplyRef = useRef(null);

    const { isLoading: commentDeletionLoading, execute: deleteCommentExecute } =
        useDeleteComment();
    const { isLoading: commentUpdateLoading, execute: UpdateCommentExecute } =
        useUpdateComment();
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

    useEffect(() => {
        if (createReplyError) {
            toast.error(createReplyError.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    }, [createReplyError]);

    const handleReplyChange = (e) => {
        setReplyText(e.target.value);
    };

    const handleAddReply = async () => {
        try {
            await createReplyExecute(postId, id, replyText);
            setReplyText("");
            setRepliesCount((prevCount) => prevCount + 1);
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
        handleCommentDeletion();
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
        }, 100);
    };

    return (
        <>
            <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                className="flex flex-col shadow-md rounded-lg mt-3 w-full px-2 py-4 md:p-4 glass"
            >
                <div className="info flex flex-col flex-1">
                    <div className="flex flex-row flex-grow">
                        <img
                            className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-2xl shadow-lg"
                            src={photoUrl || `${imagesDir}/profile.webp`}
                            alt="Author"
                        />
                        <div className="ml-4 flex flex-col justify-center flex-grow">
                            <h1 className="text-md md:text-xl text-secondary font-bold">
                                {authorName}
                            </h1>
                            <p className="text-xs md:text-md text-info">
                                {commentedAt}
                            </p>
                        </div>
                        <div className="actions flex">
                            {authorId === currentUserId && (
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
                                                    `delete-reply-modal-${id}`
                                                )
                                                .showModal()
                                        }
                                    >
                                        <RiDeleteBin5Line />
                                    </button>
                                </>
                            )}

                            <CustomDeletionModal
                                id={`delete-reply-modal-${id}`}
                                handleConfirm={handleDelete}
                                loading={commentDeletionLoading}
                            />
                        </div>
                    </div>

                    <div className="my-1 p-2">
                        {isEditing ? (
                            <div className="flex flex-col md:flex-row items-center gap-2 text-xl">
                                <textarea
                                    value={tempCommentText}
                                    rows={4}
                                    onChange={(e) =>
                                        setTempCommentText(e.target.value)
                                    }
                                    className="textarea textarea-sm md:textarea-lg textarea-bordered w-full"
                                    disabled={
                                        commentDeletionLoading ||
                                        commentUpdateLoading
                                    }
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSaveEdit}>
                                        <MdOutlineDoneOutline className="text-success" />
                                    </button>
                                    <button onClick={toggleEdit}>
                                        <IoIosCloseCircleOutline className="text-error" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-md md:text-lg break-all">
                                {commentText}
                            </p>
                        )}
                    </div>

                    <div className="actions flex flex-row gap-x-2 mt-2">
                        <button
                            className="btn btn-xs md:btn-sm btn-secondary btn-outline text-md max-w-52 relative"
                            onClick={toggleReplies}
                            disabled={isRepliesLoading || repliesCount === 0}
                        >
                            {isRepliesLoading && (
                                <span className="loading loading-spinner"></span>
                            )}
                            {showReplies ? (
                                <>
                                    <BiHide className="text-2xl" />
                                    Hide Replies
                                </>
                            ) : (
                                <>
                                    <BiShow className="text-2xl" />
                                    Show Replies
                                </>
                            )}
                            {repliesCount > 0 && (
                                <div className="badge badge-sm text-white badge-primary absolute -top-2 -right-2">
                                    {repliesCount}
                                </div>
                            )}
                        </button>
                        <button
                            className="btn btn-xs md:btn-sm btn-primary btn-outline text-md max-w-52"
                            onClick={scrollToAddReply}
                            disabled={isCreateLoading || !commentText}
                        >
                            <BiMessageAltAdd className="text-2xl" />
                            Reply
                        </button>
                    </div>
                </div>
                {showReplies && (
                    <div className="mt-4">
                        {repliesData &&
                            repliesData.map((reply) => (
                                <Reply
                                    key={`reply-${reply.id}`}
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
                                    currentUserId={currentUserId}
                                />
                            ))}
                    </div>
                )}

                {showReplyInput && (
                    <div className="mt-4 text-xs md:text-md">
                        <textarea
                            ref={addReplyRef}
                            value={replyText}
                            onChange={handleReplyChange}
                            placeholder="Write your reply..."
                            rows={1}
                            className="textarea textarea-xs md:textarea-lg textarea-bordered w-full"
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
            </motion.div>
        </>
    );
};
