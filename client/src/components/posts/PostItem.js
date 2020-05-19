import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { connect } from "react-redux";
import { addLike, removeLike } from "../../actions/post";

const PostItem = ({
  addLike,
  removeLike,
  auth,
  post: { _id, text, firstName, lastName, user, likes, comments, date },
}) => (
  <div class="post bg-white p-1 my-1">
    <div>
      <a href="profile.html">
        <img
          class="round-img"
          src="https://st.depositphotos.com/1779253/5140/v/950/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg"
          alt=""
        />
        <h4>{firstName + " " + lastName}</h4>
      </a>
    </div>
    <div>
      <p class="my-1">{text}</p>
      <p class="post-date">
        Posted on <Moment format="DD/MM/YY">{date}</Moment>
      </p>
      <button onClick={(e) => addLike(_id)} type="button" class="btn btn-light">
        <i class="fas fa-thumbs-up"></i>
        {likes.length > 0 && <span> {" " + likes.length}</span>}
      </button>
      <button
        onClick={(e) => removeLike(_id)}
        type="button"
        class="btn btn-light"
      >
        <i class="fas fa-thumbs-down"></i>
      </button>
      <Link to={`/post/${_id}`} class="btn btn-primary">
        Discussion{" "}
        {comments.length > 0 && (
          <span class="comment-count">{comments.length}</span>
        )}
      </Link>
      {!auth.loading ||
        (user === auth.user._id && (
          <button type="button" class="btn btn-danger">
            <i class="fas fa-times"></i>
          </button>
        ))}
    </div>
  </div>
);
PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { addLike, removeLike })(PostItem);
