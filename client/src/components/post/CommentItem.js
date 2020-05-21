import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { connect } from "react-redux";
import { deleteComment } from "../../actions/post";

const CommentItem = ({
  postId,
  comment: { _id, text, firstName, lastName, user, date },
  auth,
  deleteComment,
}) => (
  <div class="post bg-white p-1 my-1">
    <div>
      <Link to={`/profiles/${user}`}>
        <img
          class="round-img"
          src="https://st.depositphotos.com/1779253/5140/v/950/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg"
          alt=""
        />
        <h4>{firstName + " " + lastName}</h4>
      </Link>
    </div>
    <div>
      <p class="my-1">{text}</p>
      <p class="post-date">
        Posted on <Moment format="DD/MM/YYYY">{date}</Moment>
      </p>
      {!auth.loading && user === auth.user._id && (
        <button
          onClick={(e) => deleteComment(postId, _id)}
          type="button"
          className="btn btn-danger"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  </div>
);

CommentItem.propTypes = {
  postId: PropTypes.number.isRequired,
  comment: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { deleteComment })(CommentItem);
