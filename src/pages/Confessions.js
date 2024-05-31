import React, { useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { HiOutlineMenu } from "react-icons/hi";
import { MdOutlineAddComment } from "react-icons/md";
import { useGetPosts } from "../api/posts/getPosts";

const ConfessionSkeleton = () => {
    return (
        <div className="flex flex-col mb-8 mt-4 mx-2 p-4 glass shadow-md rounded-lg animate-pulse">
            <div className="info flex flex-row justify-between">
                <div className="flex flex-row">
                    <div className="w-24 h-24 bg-gray-300 rounded-2xl shadow-lg"></div>
                    <div className="ml-4 flex flex-col justify-center">
                        <div className="h-6 bg-gray-300 rounded w-36 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
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
            <div className="h-6 bg-gray-300 rounded w-64 mt-4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <button className="btn btn-secondary btn-outline text-md mt-4 w-52 mx-auto bg-gray-300"></button>
        </div>
    );
};

const Confession = ({
    authorName = "David Doe",
    title = "Lorem ipsum dolor sit amet consectetur.",
    content = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi nemo unde nobis voluptatem impedit adipisci velit, at, facere sunt iure delectus, minima ea tempora obcaecati vitae iste abquam aperiam.",
    date = "5 hours ago",
    image = "images/doctorPhoto.png",
}) => {
    return (
        <div className="flex flex-col mb-8 mt-4 mx-2 p-4 glass shadow-md rounded-lg">
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
                            <a>Report</a>
                        </li>
                    </ul>
                </div>
            </div>
            <h1 className="text-2xl text-secondary font-semibold p-5">
                {title}
            </h1>
            <p className="text-xl text-info-content">{content}</p>
            <button className="btn btn-secondary btn-outline text-md mt-4 w-52 mx-auto">
                <MdOutlineAddComment className="text-2xl" />
                Add Comment
            </button>
        </div>
    );
};

export const Confessions = () => {
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
            loader={<ConfessionSkeleton />}
            endMessage={<p className="text-centr">...</p>}
        >
            <div className="row">
                <div className="col col-8">
                    {data &&
                        data.map((post) => (
                            <Confession
                                key={post.id}
                                authorName={post.authorName}
                                title={post.title}
                                content={post.content}
                                date={post.date}
                                image={post.image}
                            />
                        ))}
                    {isLoading && page === 1 && (
                        <>
                            <ConfessionSkeleton />
                            <ConfessionSkeleton />
                        </>
                    )}
                </div>
                <div className="col col-4">
                    <Confession />
                </div>
            </div>
        </InfiniteScroll>
    );
};

export default Confessions;
