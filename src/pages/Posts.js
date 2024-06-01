import React, { useEffect, useCallback, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { HiOutlineMenu } from "react-icons/hi";
import { BiHide, BiShow, BiMessageAltAdd } from "react-icons/bi";
import { useGetPosts } from "../api/posts/getPosts";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import { Comment } from "./Comment";
import { useGetComments } from "../api/comments/getComments";
import { useCreateComment } from "../api/comments/postComment";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const PostSkeleton = () => {
    return (
        <div className="flex flex-col mb-8 mt-4 mx-2 p-4 glass shadow-md rounded-lg animate-pulse">
            <div className="info flex flex-row justify-between">
                <div className="flex flex-row">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-300 rounded-2xl shadow-lg"></div>
                    <div className="ml-4 flex flex-col justify-center">
                        <div className="h-4 md:h-6 bg-gray-300 rounded w-24 md:w-36 mb-2"></div>
                        <div className="h-3 md:h-4 bg-gray-300 rounded w-20 md:w-24"></div>
                    </div>
                </div>
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn m-1 bg-gray-300"
                    ></div>
                </div>
            </div>
            <div className="h-4 md:h-6 bg-gray-300 rounded w-full md:w-64 mt-4 mb-2"></div>
            <div className="h-3 md:h-4 bg-gray-300 rounded w-full md:w-full mb-4"></div>
            <div className="h-3 md:h-4 bg-gray-300 rounded w-full md:w-5/6 mb-4"></div>
            <div className="h-3 md:h-4 bg-gray-300 rounded w-full md:w-3/4 mb-4"></div>
            <button className="btn btn-secondary btn-outline text-md mt-4 w-full md:w-52 mx-auto bg-gray-300"></button>
        </div>
    );
};

const Post = ({
    id,
    authorName = "David Doe",
    authorId = -1,
    title = "Lorem ipsum dolor sit amet consectetur.",
    content = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi nemo unde nobis voluptatem impedit adipisci velit, at, facere sunt iure delectus, minima ea tempora obcaecati vitae iste abquameriam.",
    date = "5 hours ago",
    image = "images/doctorPhoto.png",
}) => {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
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
            await getCommentsExecute(id); // Refresh comments after adding a new one
            setShowComments(true);
        } catch (e) {
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

    return (
        <div className="flex flex-col mb-8 mt-4 mx-2 p-4 glass shadow-md rounded-lg cursor-pointer">
            <div className="info flex flex-row justify-between">
                <div className="flex flex-row">
                    <img
                        className="w-24 h-24 rounded-2xl shadow-lg"
                        src={image}
                        alt="Author"
                    />
                    <div className="ml-4 flex flex-col justify-center">
                        <h1 className="text-xl text-secondary font-bold">
                            {authorName}
                        </h1>
                        <p className="text-info">{date}</p>
                    </div>
                </div>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn m-1">
                        <HiOutlineMenu className="text-2xl" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <button className="btn btn-primary btn-outline">
                                Edit
                            </button>
                        </li>
                        <li>
                            <button className="btn btn-error">Report</button>
                        </li>
                        <li>
                            <button className="btn btn-error btn-outline">
                                Delete
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <h1 className="text-2xl text-secondary font-semibold p-5">
                {title}
            </h1>
            <p className="text-xl text-info-content">{content}</p>

            {showComments && (
                <div className="mt-4">
                    {commentsData &&
                        commentsData.map((comment) => (
                            <Comment
                                key={"comment-" + comment.id}
                                id={comment.id}
                                content={comment.content}
                                authorName={comment.username}
                                commentedAt={convertUtcToRelativeTime(
                                    comment.commentedAt
                                )}
                                authorId={comment.appUserId}
                                postId={id}
                                handleDeleteComment={async () =>
                                    await getCommentsExecute(id)
                                }
                            />
                        ))}
                </div>
            )}

            <div className="mt-4">
                <input
                    type="text"
                    value={commentText}
                    onChange={handleCommentChange}
                    placeholder="Add a comment..."
                    className="input input-bordered w-full mb-2"
                    disabled={isCreateLoading}
                />
                <div className="flex flex-row items-center justify-between mt-1">
                    <button
                        className="btn btn-sm btn-secondary btn-outline text-md max-w-52"
                        onClick={toggleComments}
                        disabled={isCommentsLoading}
                    >
                        {isCommentsLoading && (
                            <span className="loading loading-spinner"></span>
                        )}
                        {showComments && commentsData.length > 0 ? (
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
                    </button>
                    <button
                        className="btn btn-sm btn-primary btn-outline text-md max-w-52"
                        onClick={handleAddComment}
                        disabled={isCreateLoading}
                    >
                        {isCreateLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <BiMessageAltAdd className="text-2xl" />
                        )}
                        Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Posts = () => {
    const { isLoading, error, data, page, execute } = useGetPosts();

    useEffect(() => {
        execute();
    }, [execute]);

    const loadMore = useCallback(() => {
        execute(page + 1);
    }, [execute, page]);

    if (error) {
        return <div>Error loading confessions</div>;
    }

    return (
        <InfiniteScroll
            dataLength={data.length}
            next={loadMore}
            hasMore={!isLoading && data.length % 20 === 0} // Assumes pageSize is 20
            loader={
                <>
                    <PostSkeleton />
                </>
            }
            endMessage={<p className="text-center">...</p>}
        >
            <div className="row">
                <div className="lg:flex lg:flex-col xl:col xl:col-8">
                    {data &&
                        data.map((post, index) => (
                            <Post
                                key={"post-" + post.id + "-" + index}
                                id={post.id}
                                authorName={post.username}
                                title={post.title}
                                content={post.content}
                                date={convertUtcToRelativeTime(post.postedOn)}
                                image={post.image}
                            />
                        ))}
                    {isLoading && page === 1 && (
                        <>
                            <PostSkeleton />
                        </>
                    )}
                </div>
                <div className="md:flex-none xl:col xl:col-4">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            </div>
        </InfiniteScroll>
    );
};

export default Posts;
