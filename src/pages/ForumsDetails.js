import { useEffect } from "react";
import { useGetPostById } from "../api/posts/getPostById";
import { PostSkeleton } from "../components/ui/PostSkeleton";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import { Post } from "../components/ui/Post";
import { useAuth } from "../auth/authProvider";
import { useParams } from "react-router-dom";

export const ForumsDetails = () => {
    const { isLoading, error, data: post, setData, execute } = useGetPostById();
    const { id } = useParams();
    const { userId } = useAuth();

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

    return (
        <div className="row justify-center mx-auto max-w-3xl mt-8">
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
                    setData={setData}
                    currentUserId={userId}
                />
            )}
        </div>
    );
};
