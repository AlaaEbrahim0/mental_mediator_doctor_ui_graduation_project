import React, { useEffect, useCallback, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGetPosts } from "../api/posts/getPosts";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import toast from "react-hot-toast";
import { PostSkeleton } from "../components/ui/PostSkeleton";
import { CreatePostModal } from "../components/ui/CreatePostModal";
import { useCreatePost } from "../api/comments/createPost";
import { Post } from "../components/ui/Post";
import { useAuth } from "../auth/authProvider";

export const Forums = () => {
    const { isLoading, error, data, setData, page, hasMore, execute, reset } =
        useGetPosts();

    const { userId } = useAuth();

    const [isModalVisible, setModalVisible] = useState(false);
    const [showConfessions, setShowConfessions] = useState(false);
    const initialFetchRef = useRef(false);

    useEffect(() => {
        if (!initialFetchRef.current) {
            execute(1, 20, showConfessions);
            initialFetchRef.current = true;
        }
    }, [execute, showConfessions]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            execute(page + 1, 20, showConfessions);
        }
    }, [execute, page, hasMore, isLoading, showConfessions]);

    const handleAddPostClick = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    const {
        isLoading: isCreatePostLoading,
        error: createPostError,
        execute: createPostExecute,
    } = useCreatePost();
    const handleCreatePost = async (title, content, postPhoto) => {
        if (!title || !content) {
            return;
        }
        try {
            const newPost = await createPostExecute(title, content, postPhoto);
            setData([newPost, ...data]);
            setModalVisible(false);
        } catch (e) {
            toast.error(e.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };
    const toggleShowConfessions = () => {
        setShowConfessions((prevState) => !prevState);
        reset();
        execute(1, 20, !showConfessions);
    };

    if (error) {
        return <div>Error loading posts</div>;
    }

    return (
        <>
            <InfiniteScroll
                dataLength={data.length}
                next={loadMore}
                hasMore={!isLoading && hasMore}
                loader={<PostSkeleton />}
            >
                <div className="row">
                    <div className="lg:flex lg:flex-col xl:col xl:col-8">
                        <div className="flex justify-between mx-2 my-2">
                            <button
                                className="btn btn-sm md:btn ml-4 w-24"
                                onClick={handleAddPostClick}
                            >
                                Add Post
                            </button>

                            <div className="flex items-center">
                                <span className="mr-2 text-sm md:text-lg font-medium">
                                    Show Confessions
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-md md:toggle-lg"
                                    onChange={toggleShowConfessions}
                                />
                            </div>
                        </div>
                        {data &&
                            data.map((post, index) => (
                                <Post
                                    key={"post-" + post.id + "-" + index}
                                    id={post.id}
                                    authorName={post.username}
                                    authorId={post.appUserId}
                                    title={post.title}
                                    content={post.content}
                                    date={convertUtcToRelativeTime(
                                        post.postedOn
                                    )}
                                    image={post.photoUrl}
                                    postPhoto={post.postPhotoUrl}
                                    commentCount={post.commentsCount}
                                    setData={setData}
                                    currentUserId={userId}
                                />
                            ))}

                        {isLoading && page === 1 && (
                            <>
                                <PostSkeleton />
                                <PostSkeleton />
                                <PostSkeleton />
                            </>
                        )}
                    </div>
                    <div className="hidden md:flex md:flex-col xl:col xl:col-4">
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                </div>
                <CreatePostModal
                    isVisible={isModalVisible}
                    onClose={handleCloseModal}
                    onCreate={handleCreatePost}
                    loading={isCreatePostLoading}
                />
            </InfiniteScroll>
        </>
    );
};
