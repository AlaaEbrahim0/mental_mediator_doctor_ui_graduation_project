import React, { useEffect, useCallback, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGetPosts } from "../api/posts/getPosts";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import toast from "react-hot-toast";
import { PostSkeleton } from "../components/ui/PostSkeleton";
import { CreatePostModal } from "../components/ui/CreatePostModal";
import { useCreatePost } from "../api/comments/createPost";
import { useDeletePost } from "../api/comments/deletePost";
import { useNavigate } from "react-router-dom";
import { Post } from "../components/ui/Post";
import { useAuth } from "../auth/authProvider";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import { FilterationComponent } from "../components/ui/FilterationComponent";
import { Articles } from "./Home";
import { NewsSection } from "./Home";

export const Forums = () => {
    const { isLoading, error, data, setData, page, hasMore, execute, reset } =
        useGetPosts();
    const { isLoadingDelete, execute: executeDelete } = useDeletePost();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFilterVisible, setFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        fullname: "",
        title: "",
        content: "",
        from: "",
        to: "",
        showConfessions: false,
    });

    useEffect(() => {
        execute(1, 20, filters);
    }, [execute, filters]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            execute(page + 1, 20, filters);
        }
    }, [execute, page, hasMore, isLoading, filters]);

    const handleDeletePost = async (id) => {
        try {
            await executeDelete(id);
            setData((prev) => prev.filter((post) => post.id !== id));
        } catch (e) {
            toast.error(e.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };

    const toggleShowFilters = () => {
        setFilterVisible((prevState) => !prevState);
    };

    const handleAddPostClick = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    const { isLoading: isCreatePostLoading, execute: createPostExecute } =
        useCreatePost();
    const handleCreatePost = async (title, content, postPhoto) => {
        if (!title || !content) {
            return;
        }
        try {
            await createPostExecute(title, content, postPhoto);
            reset();
            setFilters({
                fullname: "",
                title: "",
                content: "",
                from: "",
                to: "",
                showConfessions: false,
            });
            await execute(1, 20, filters);
            setModalVisible(false);
        } catch (e) {
            toast.error(e.errors[0].description, {
                duration: 4000,
                position: "top-center",
                className: "text-lg text-primary",
            });
        }
    };

    const handleFilter = (appliedFilters) => {
        setFilters(appliedFilters);
        reset();
        execute(1, 50, appliedFilters);
    };

    if (error) {
        return <div>Error loading posts</div>;
    }

    return (
        <>
            <motion.div>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMore}
                    hasMore={!isLoading && hasMore}
                    loader={<PostSkeleton />}
                    scrollThreshold={0.8} // Adjust the scroll threshold
                    scrollableTarget="scrollableDiv" // Ensure proper target for scrollable container
                >
                    <div className="block lg:flex">
                        <div className="md:flex md:flex-col lg:col lg:col-6 xl:col xl:col-8">
                            <div className="flex flex-row justify-between my-2 mx-2">
                                <button
                                    className="btn btn-sm md:btn-secondary md:btn-outline md:btn w-24"
                                    onClick={handleAddPostClick}
                                >
                                    Add Post
                                </button>
                                <button
                                    className="btn btn-sm btn-outline md:btn md:btn-outline"
                                    onClick={toggleShowFilters}
                                >
                                    <FiFilter />
                                    Filter
                                </button>
                            </div>
                            {isFilterVisible && (
                                <div className="fixed inset-0 z-50 flex items-center  justify-center bg-black bg-opacity-50">
                                    <FilterationComponent
                                        onClose={toggleShowFilters}
                                        onFilter={handleFilter}
                                    />
                                </div>
                            )}
                            {!isLoading && data.length === 0 && (
                                <div className="text-center text-3xl">
                                    No Posts were found
                                </div>
                            )}
                            {!isLoading && data.length > 0 && (
                                <AnimatePresence>
                                    {data &&
                                        data.map((post, index) => (
                                            <AnimatedPost
                                                key={
                                                    "post-" +
                                                    post.id +
                                                    "-" +
                                                    index
                                                }
                                                post={post}
                                                index={index}
                                                handleDeletePost={
                                                    handleDeletePost
                                                }
                                                userId={userId}
                                                isLoadingDelete={
                                                    isLoadingDelete
                                                }
                                                setData={async () => {
                                                    reset();
                                                    await execute(
                                                        1,
                                                        50,
                                                        filters
                                                    );
                                                }}
                                            />
                                        ))}
                                </AnimatePresence>
                            )}
                            {isLoading && page === 1 && (
                                <div className="lg:flex lg:flex-col lg:justify-center lg:w-full">
                                    <PostSkeleton />
                                    <PostSkeleton />
                                    <PostSkeleton />
                                </div>
                            )}
                        </div>
                        <div className="hidden md:flex md:flex-col lg:col lg:col-6 xl:col xl:col-4">
                            {/* <PostSkeleton />
                            <PostSkeleton />
                            <PostSkeleton /> */}
                            <NewsSection />
                        </div>
                    </div>
                    <CreatePostModal
                        isVisible={isModalVisible}
                        onClose={handleCloseModal}
                        onCreate={handleCreatePost}
                        loading={isCreatePostLoading}
                    />
                </InfiniteScroll>
            </motion.div>
        </>
    );
};

const AnimatedPost = ({
    post,
    index,
    handleDeletePost,
    userId,
    isLoadingDelete,
    setData,
}) => {
    const [ref, isIntersecting] = useInView({ threshold: 0.1 });

    const variants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
        },
        exit: { scale: 0.9, opacity: 0 },
    };

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isIntersecting ? "visible" : "exit"}
            exit="exit"
        >
            <Post
                id={post.id}
                authorName={post.username}
                authorId={post.appUserId}
                title={post.title}
                content={post.content}
                date={convertUtcToRelativeTime(post.postedOn)}
                image={post.photoUrl}
                postPhoto={post.postPhotoUrl}
                commentCount={post.commentsCount}
                setData={setData}
                currentUserId={userId}
                handleDelete={handleDeletePost}
                postDeletionLoading={isLoadingDelete}
            />
        </motion.div>
    );
};

export const useInView = (options) => {
    const [isIntersecting, setIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIntersecting(entry.isIntersecting),
            options
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isIntersecting];
};
