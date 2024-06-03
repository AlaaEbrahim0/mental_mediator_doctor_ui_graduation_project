import React, { useEffect, useCallback, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGetPosts } from "../../api/posts/getPosts";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";
import toast from "react-hot-toast";
import { PostSkeleton } from "../PostSkeleton";
import { CreatePostModal } from "../CreatePostModal";
import { useCreatePost } from "../../api/comments/createPost";
import { Post } from "../Post";

export const Forums = () => {
    const { isLoading, error, data, setData, page, hasMore, execute } =
        useGetPosts();
    const [isModalVisible, setModalVisible] = useState(false);
    const initialFetchRef = useRef(false);

    console.log(data);

    useEffect(() => {
        if (!initialFetchRef.current) {
            execute();
            initialFetchRef.current = true;
        }
    }, [execute]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            execute(page + 1);
        }
    }, [execute, page, hasMore, isLoading]);

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
                // endMessage={<p className="text-center">No more posts</p>}
            >
                <div className="row">
                    <div className="lg:flex lg:flex-col xl:col xl:col-8">
                        <div>
                            <button
                                className="btn w-24 btn-secondary my-2"
                                onClick={handleAddPostClick}
                            >
                                Add Post
                            </button>
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
                    <div className="md:flex-none xl:col xl:col-4">
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
