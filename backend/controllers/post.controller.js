import Comment from "../models/commnet.schema.js";
import Post from "../models/post.schema.js";
import User from "../models/user.schema.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import SavedPost from "./../models/savedPost.schema.js";
import {uploadOnCloudinary} from "./../utils/cloudinary.js";

// * Fetch Post
export const fetchPost = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("userId");

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Post fetched successfully"));
});

// * Create Post
export const createPost = asyncHandler(async (req, res) => {
  const {postName, category, description} = req?.body;
  const userId = req.user.id;
  // console.log(userId);
  const user = await User.findOne({_id: userId});
  const coverImageLocalPath = await req.file?.path;
  console.log("COVER IMAGE : ", coverImageLocalPath);

  if (!coverImageLocalPath) {
    throw new ApiError(406, "images required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(coverImage);
  if (!coverImage) {
    throw new ApiError(406, "images required");
  }
  const newPost = new Post({
    postName,
    description,
    category,
    image:
      coverImage.url ||
      "https://res.cloudinary.com/dvgixthd0/image/upload/v1714042682/sample.jpg",
    userId: user._id,
  });
  await newPost.save();
  res
    .status(200)
    .json(new ApiResponse(200, newPost, "Post Created Successfully"));
});

// * Add comment
export const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const review = req.body?.review;
  // console.log(req.body);
  const post = await Post.findOne({_id: postId});
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const newComment = await Comment.create({
    userId: req.user.id,
    postId: req.params.id,
    review: review,
  });

  post.comment.push(newComment._id);
  await post.save();
  // console.log(post);
  res.status(200).json(new ApiResponse(200, post, "Comment Submitted"));
});

export const showComment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const comments = await Comment.find({postId: id})
    .populate("userId")
    .sort({createdAt: -1});
  if (!comments || comments.length === 0) {
    // console.log("No comments ");
    return new ApiResponse(202, comments, "No comments");
  }

  const count = await Comment.find({postId: id}).countDocuments();

  res
    .status(200)
    .json(
      new ApiResponse(200, {comments, count}, "Comment fetched successfully"),
    );
});

// * Save Post
export const savePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req?.user.id;

  if (!userId) {
    throw new ApiError(404, "User not found");
  }

  const user = await User.findOne({_id: userId});
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existPost = await SavedPost.findOne({
    postId: post._id,
    userId: user._id,
  });

  if (existPost) {
    return res
      .status(201)
      .json(new ApiResponse(201, post, "Post already saved"));
  }

  const newSavedPost = new SavedPost({
    userId: user._id,
    postId: post._id,
  });

  await newSavedPost.save();
  user.savedPost.push(post._id);
  await user.save();

  res.status(200).json(new ApiResponse(200, "Post saved successfully"));
});

// * Fetch Save Post
export const fetchSavePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({_id: userId});
  const post = await User.findOne({_id: userId}).populate("savedPost");
  if (!post || post.length === 0) {
    // console.log("Post is empty");
  }
  // console.log(user.savedPost);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, post, "Save post fetch successfully"));
});

// * show post
export const showPost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findOne({_id: postId}).populate("userId");
  // console.log(post);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, post, "Product fetch successfully"));
});

export const downloadPost = asyncHandler(async (req, res) => {
  const filename = req.params.id;
  // console.log(filename);
  const filePath = path.join(__dirname, "uploads", filename);
  // console.log(filePath);
  res.download(filePath, filename);
});
