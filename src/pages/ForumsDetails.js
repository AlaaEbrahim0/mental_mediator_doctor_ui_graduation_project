import { useEffect, useRef } from "react";
import { useGetPostById } from "../api/posts/getPostById";
import { PostSkeleton } from "../components/ui/PostSkeleton";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import { Post } from "../components/ui/Post";
import { useAuth } from "../auth/authProvider";
import { useNavigate, useParams } from "react-router-dom";
import { useDeletePost } from "../api/comments/deletePost";
import toast from "react-hot-toast";

export const ForumsDetails = () => {
    const { isLoading, error, data: post, setData, execute } = useGetPostById();
    const {
        isLoadingDelete,
        deleteError,
        execute: executeDelete,
    } = useDeletePost();
    const navigate = useNavigate();
    const postRef = useRef(null); // Ref for the post element

    const { id } = useParams();
    const { userId } = useAuth();

    useEffect(() => {
        // Scroll to the comment/reply if anchor exists in the URL
        const hash = window.location.hash;
        if (hash && hash.startsWith("#comment-")) {
            const commentId = hash.substring("#comment-".length);
            const commentElement = document.getElementById(`${commentId}`);
            if (commentElement) {
                commentElement.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, []);

    useEffect(() => {
        const postId = Number(id);
        if (!isNaN(postId)) {
            execute(postId);
        }
    }, [execute, id]);

    if (!id || isNaN(Number(id))) {
        return (
            <div className="alert alert-error text-white">
                <span>Invalid post ID.</span>
            </div>
        );
    }

    const handleDelete = async (id) => {
        await executeDelete(id);
        navigate("/community", { replace: true });
        toast.success("Post has been deleted successfully");
    };

    return (
        <div
            className="row justify-center mx-auto max-w-3xl mt-4"
            ref={postRef}
        >
            {isLoading && <PostSkeleton />}
            {!isLoading && error && (
                <div className="alert alert-error text-white">
                    <span>This page was deleted.</span>
                </div>
            )}
            {!isLoading && !error && post && (
                <Post
                    key={"post-" + post.id}
                    id={post.id}
                    authorName={post.username}
                    authorId={post.appUserId}
                    title={post.title}
                    content={post.content}
                    date={convertUtcToRelativeTime(post.postedOn)}
                    image={post.photoUrl}
                    postPhoto={post.postPhotoUrl}
                    commentCount={post.commentsCount}
                    data={post}
                    setData={async () => {
                        setData(await execute(post.id));
                    }}
                    currentUserId={userId}
                    handleDelete={handleDelete}
                    postDeletionLoading={isLoadingDelete}
                />
            )}
        </div>
    );
};
