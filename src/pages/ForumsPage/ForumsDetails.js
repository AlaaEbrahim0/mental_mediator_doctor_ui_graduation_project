import { useEffect } from "react";
import { useGetPostById } from "../../api/posts/getPostById";
import { PostSkeleton } from "../PostSkeleton";
import { convertUtcToRelativeTime } from "../../utils/utcToRelativeTime";
import { Post } from "../Post";
import { useParams } from "react-router-dom";

export const ForumsDetails = () => {
    const { isLoading, error, data: post, setData, execute } = useGetPostById();
    const { id } = useParams();

    useEffect(() => {
        execute(id);
    }, [execute, id]);

    console.log(post);

    return (
        <div className="row justify-center mx-auto max-w-3xl">
            {isLoading && <PostSkeleton />}
            {!isLoading && (
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
                />
            )}
        </div>
    );
};
