import React, { useEffect, useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { BiHide, BiShow, BiMessageAltAdd } from "react-icons/bi";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";
import { Comment } from "./Comment";
import { useGetComments } from "../../api/comments/getComments";
import { Link } from "react-router-dom";
import { useCreateComment } from "../../api/comments/postComment";
import toast from "react-hot-toast";
import { useUpdatePost } from "../../api/comments/updatePost";
import UpdatePostModal from "./UpdatePostModal"; // Import the UpdatePostModal component
import { CustomDeletionModal } from "./CustomDeletionModal";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;
console.log(imagesDir);

export const Post = ({
    id,
    authorName,
    authorId,
    title,
    content,
    date,
    image,
    postPhoto,
    commentCount: initialCommentCount,
    setData,
    currentUserId,
    handleDelete,
    postDeletionLoading,
}) => {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(initialCommentCount);
    const [isUpdateModalVisible, setUpdateModalVisible] = useState(false); // Add state to control the visibility of the update modal

    const {
        isLoading: isUpdatePostLoading,
        error: updatePostError,
        execute: updatePostExecute,
    } = useUpdatePost();

    const {
        isLoading: isCommentsLoading,
        error: commentsError,
        data: commentsData,
        execute: getCommentsExecute,
    } = useGetComments();

    const {
        isLoading: isCreateLoading,
        error: createCommentError,
        execute: createCommentExecute,
    } = useCreateComment();

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };
    const handleAddComment = async () => {
        if (!commentText) {
            return;
        }
        try {
            await createCommentExecute(id, commentText);
            setCommentText("");
            setCommentCount((prevCount) => prevCount + 1);
            await getCommentsExecute(id);
            setShowComments(true);
            toast.success("Comment has been  added successfully", {});
        } catch (e) {
            console.log(e);
            toast.error(e.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };
    const toggleComments = async () => {
        if (!showComments) {
            await getCommentsExecute(id);
        }
        setShowComments(!showComments);
    };

    useEffect(() => {
        setCommentCount(initialCommentCount);
    }, [initialCommentCount]);

    const handleUpdatePost = async (id, title, content, postPhoto) => {
        if (!title || !content) {
            return;
        }
        try {
            const updatedPost = await updatePostExecute(
                id,
                title,
                content,
                postPhoto
            );

            setData((prev) =>
                prev.map((post) => (post.id === id ? updatedPost : post))
            );

            setUpdateModalVisible(false);
        } catch (e) {
            toast.error(e.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };

    return (
        <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            className="flex flex-col mb-8 p-4 mt w-full glass shadow-md rounded-lg"
        >
            <div className="info flex flex-row justify-between">
                <div className="flex flex-row">
                    <img
                        className="w-12 h-12 md:w-24 md:h-24 rounded-2xl shadow-md object-cover"
                        src={image || imagesDir + "/profile.webp"}
                        alt="Author"
                    />
                    <div className="ml-4 flex flex-col justify-center">
                        <h1 className="text-xl text-secondary font-bold">
                            {authorName || "Anonymous"}
                        </h1>
                        <p className="text-info">
                            {convertUtcToRelativeTime(date)}
                        </p>
                    </div>
                </div>

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="md:btn m-1">
                        <HiOutlineMenu className="text-md md:text-2xl" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                    >
                        {authorId === currentUserId && (
                            <>
                                <li className="mb-1">
                                    <button
                                        className="btn btn-sm btn-secondary btn-outline text-md"
                                        onClick={() =>
                                            setUpdateModalVisible(true)
                                        } // Show update modal on click
                                    >
                                        Edit
                                    </button>
                                </li>
                                <li className="mb-1">
                                    <>
                                        <button
                                            className="btn btn-sm btn-error btn-outline text-md"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "delete-post-modal-" +
                                                            id
                                                    )
                                                    .showModal()
                                            }
                                            disabled={postDeletionLoading}
                                        >
                                            {postDeletionLoading && (
                                                <span className="loading loading-spinner text-error"></span>
                                            )}
                                            Delete
                                        </button>
                                    </>
                                </li>
                                <CustomDeletionModal
                                    id={"delete-post-modal-" + id}
                                    handleConfirm={async () => handleDelete(id)}
                                    loading={postDeletionLoading}
                                />
                            </>
                        )}
                        <li>
                            <button className="btn btn-sm btn-error text-md">
                                Report
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <Link
                className="w-full hover:cursor-pointer pl-2"
                to={`/forums/${id}`}
            >
                <h1 className="text-sm sm:text-md md:text-2xl text-secondary font-semibold py-5 break-all">
                    {title}
                </h1>
                <p className="text-sm md:text-xl text-info-content break-all">
                    {content}
                </p>
            </Link>
            {postPhoto && (
                <img
                    src={postPhoto}
                    className="w-full h-full object-cover rounded-lg mt-5"
                    alt="Post"
                />
            )}
            {showComments && (
                <div className="mt-4">
                    {commentsData &&
                        commentsData.map((comment) => (
                            <Comment
                                key={"comment-" + comment.id}
                                id={comment.id}
                                content={comment.content}
                                authorName={comment.username || "Anonymous"}
                                commentedAt={convertUtcToRelativeTime(
                                    comment.commentedAt
                                )}
                                authorId={comment.appUserId}
                                postId={id}
                                handleDeleteComment={async () =>
                                    await getCommentsExecute(id)
                                }
                                photoUrl={comment.photoUrl}
                                handleCommentDeletion={() =>
                                    setCommentCount(commentCount - 1)
                                }
                                currentUserId={currentUserId}
                                repliesCount={comment.repliesCount}
                            />
                        ))}
                </div>
            )}

            <div className="mt-4" />
            <textarea
                type="text"
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="textarea textarea-bordered textarea-md md:textarea-lg w-full mb-2"
                disabled={isCreateLoading}
            />
            <div className="flex flex-row items-center justify-between mt-1">
                <button
                    className="btn btn-xs md:btn-sm btn-secondary btn-outline text-md max-w-52 relative"
                    onClick={toggleComments}
                    disabled={isCommentsLoading || commentCount === 0}
                >
                    {isCommentsLoading && (
                        <span className="loading loading-spinner"></span>
                    )}
                    {showComments ? (
                        <>
                            <BiHide className="text-2xl" />
                            Hide Comments
                        </>
                    ) : (
                        <>
                            <BiShow className="text-2xl" />
                            Show Comments
                        </>
                    )}
                    {commentCount > 0 && (
                        <div className="badge badge-sm text-white badge-primary absolute -top-2 -right-2">
                            {commentCount}
                        </div>
                    )}
                </button>
                <button
                    className="btn btn-xs md:btn-sm btn-primary btn-outline text-md max-w-52"
                    onClick={handleAddComment}
                    disabled={isCreateLoading || !commentText}
                >
                    {isCreateLoading ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        <BiMessageAltAdd className="text-2xl" />
                    )}
                    Comment
                </button>
            </div>

            <UpdatePostModal // Integrate the UpdatePostModal component
                isVisible={isUpdateModalVisible}
                onClose={() => setUpdateModalVisible(false)}
                onUpdate={handleUpdatePost}
                loading={isUpdatePostLoading} // Pass the loading state
                initialData={{ id, title, content, postPhoto }}
            />
        </motion.div>
    );
};
